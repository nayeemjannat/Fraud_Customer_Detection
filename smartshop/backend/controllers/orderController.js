const Order    = require('../models/Order')
const Customer = require('../models/Customer')
const Payment  = require('../models/Payment')
const SharedBlacklist = require('../models/SharedBlacklist')
const { calculateRiskScore } = require('./fraudController')

// GET /api/orders — সব orders (filter: status, date)
exports.getOrders = async (req, res, next) => {
  try {
    const { status, from, to } = req.query
    const filter = {}
    if (status) filter.status = status
    if (from || to) filter.createdAt = {}
    if (from) filter.createdAt.$gte = new Date(from)
    if (to)   filter.createdAt.$lte = new Date(to)

    const orders = await Order.find(filter).populate('customer').sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { next(err) }
}

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer')
    if (!order) return res.status(404).json({ message: 'Order পাওয়া যায়নি' })
    res.json(order)
  } catch (err) { next(err) }
}

// POST /api/orders — নতুন order তৈরি
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, address, product, quantity, totalAmount, paymentMethod, notes, deviceId } = req.body

    // 1. Shared Blacklist Check
    const sharedBlock = await SharedBlacklist.findOne({ phone })

    // 2. Address Pattern Matching: একই address এ ৩০ দিনে ৩+ ভিন্ন নম্বর থেকে order
    const suspiciousAddress = await Order.countDocuments({
      address: { $regex: address, $options: 'i' },
      phone: { $ne: phone },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })

    // 3. Same Name + Different Number check
    const sameNameDiffPhone = await Customer.findOne({
      name: { $regex: new RegExp("^" + customerName.trim() + "$", "i") },
      phone: { $ne: phone }
    })

    // 4. Device Fingerprinting Check — এই device আগে blocked ছিল কিনা
    const blockedDeviceOrder = deviceId ? await Order.findOne({
      deviceId,
      $or: [{ riskLevel: 'blocked' }, { riskScore: { $gt: 80 } }]
    }) : null

    // Customer খোঁজো, না থাকলে তৈরি করো
    let customer = await Customer.findOne({ phone })
    if (!customer) {
      customer = await Customer.create({ name: customerName, phone, address })
    }

    // 30 minutes ago time
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const recentOrdersCount = await Order.countDocuments({
      phone,
      createdAt: { $gte: thirtyMinutesAgo }
    })

    // Fraud score calculate করো
    const { score, level, reasons } = await calculateRiskScore(customer, {
      paymentMethod,
      totalAmount,
      recentOrdersCount,
      sharedBlock,
      suspiciousAddress,
      sameNameDiffPhone,
      blockedDeviceOrder
    })

    // Auto-block: score > 80 হলে order create হবেই না
    if (score > 80) {
      return res.status(400).json({
        message: 'এই order টি automatically block হয়েছে',
        riskScore: score,
        riskLevel: 'blocked',
        reasons,
      })
    }

    // Order save করো
    const order = await Order.create({
      customerName, phone, address, product, quantity, totalAmount,
      paymentMethod, notes, customer: customer._id, deviceId,
      riskScore: score, riskLevel: level, riskReasons: reasons,
    })

    // Customer এর total order বাড়াও
    await Customer.findByIdAndUpdate(customer._id, { $inc: { totalOrders: 1 } })

    // Payment record তৈরি করো
    await Payment.create({ order: order._id, customer: customer._id, method: paymentMethod, amount: totalAmount })

    res.status(201).json({ order, riskScore: score, riskLevel: level, riskReasons: reasons })
  } catch (err) { next(err) }
}

// PUT /api/orders/:id/status — status update
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ message: 'Order পাওয়া যায়নি' })

    // Delivered হলে success count বাড়াও
    if (status === 'delivered') {
      await Customer.findByIdAndUpdate(order.customer, { $inc: { successOrders: 1 } })
    }

    // Returned বা Cancelled হলে return count বাড়াও এবং রিস্ক রিস্ক-স্কোর আপডেট করো
    if (status === 'returned' || status === 'cancelled') {
      const customer = await Customer.findByIdAndUpdate(
        order.customer,
        { $inc: { returnCount: 1 } },
        { new: true }
      )

      if (customer) {
        if (customer.returnCount >= 3) {
          // কাস্টমারকে ব্ল্যাকলিস্ট করা
          customer.blacklisted = true
          await customer.save()

          // কাস্টমারের সকল অর্ডারে (phone অথবা customer ID দিয়ে ম্যাচ করে) riskLevel: 'blocked', riskScore: 100 দেওয়া
          await Order.updateMany(
            { $or: [{ customer: customer._id }, { phone: customer.phone }] },
            {
              $set: {
                riskScore: 100,
                riskLevel: 'blocked',
                riskReasons: ['কাস্টমার রিটার্ন/ক্যান্সেল সংখ্যা ৩ বা তার বেশি হওয়ায় ব্ল্যাকলিস্টেড']
              }
            }
          )
        } else {
          // pending/confirmed সব অর্ডারের রিস্ক রি-ক্যালকুলেট করা
          const activeOrders = await Order.find({
            $or: [{ customer: customer._id }, { phone: customer.phone }],
            status: { $in: ['pending', 'confirmed'] }
          })

          for (const activeOrder of activeOrders) {
            const thirtyMinutesAgo = new Date(activeOrder.createdAt.getTime() - 30 * 60 * 1000)
            const recentOrdersCount = await Order.countDocuments({
              phone: activeOrder.phone,
              createdAt: { $gte: thirtyMinutesAgo, $lt: activeOrder.createdAt }
            })

            const suspiciousAddress = await Order.countDocuments({
              address: { $regex: activeOrder.address, $options: 'i' },
              phone: { $ne: activeOrder.phone },
              createdAt: { $gte: new Date(activeOrder.createdAt.getTime() - 30 * 24 * 60 * 60 * 1000) }
            })

            const sameNameDiffPhone = await Customer.findOne({
              name: { $regex: new RegExp("^" + activeOrder.customerName.trim() + "$", "i") },
              phone: { $ne: activeOrder.phone }
            })

            const blockedDeviceOrder = activeOrder.deviceId ? await Order.findOne({
              deviceId: activeOrder.deviceId,
              _id: { $ne: activeOrder._id },
              $or: [{ riskLevel: 'blocked' }, { riskScore: { $gt: 80 } }]
            }) : null

            const sharedBlock = await SharedBlacklist.findOne({ phone: activeOrder.phone })

            const { score, level, reasons } = await calculateRiskScore(customer, {
              phone: activeOrder.phone,
              paymentMethod: activeOrder.paymentMethod,
              totalAmount: activeOrder.totalAmount,
              recentOrdersCount,
              sharedBlock,
              suspiciousAddress,
              sameNameDiffPhone,
              blockedDeviceOrder
            })

            activeOrder.riskScore = score
            activeOrder.riskLevel = level
            activeOrder.riskReasons = reasons
            await activeOrder.save()
          }
        }
      }
    }

    res.json(order)
  } catch (err) { next(err) }
}
