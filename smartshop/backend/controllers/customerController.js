const Customer = require('../models/Customer')
const Order    = require('../models/Order')

// GET /api/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, blacklisted } = req.query
    const filter = {}
    if (search) filter.phone = { $regex: search, $options: 'i' }
    if (blacklisted !== undefined) filter.blacklisted = blacklisted === 'true'
    const customers = await Customer.find(filter).sort({ createdAt: -1 })
    res.json(customers)
  } catch (err) { next(err) }
}

// GET /api/customers/:id — customer + order history
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer পাওয়া যায়নি' })
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 })
    const reliabilityScore = customer.totalOrders > 0
      ? Math.round((customer.successOrders / customer.totalOrders) * 100) : 0
    res.json({ customer, orders, reliabilityScore })
  } catch (err) { next(err) }
}

// PUT /api/customers/:id/blacklist — blacklist toggle
exports.toggleBlacklist = async (req, res, next) => {
  try {
    const { blacklisted, reason } = req.body
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { blacklisted, blacklistReason: reason || '' },
      { new: true }
    )
    res.json(customer)
  } catch (err) { next(err) }
}
