const Payment = require('../models/Payment')
const Order   = require('../models/Order')

// GET /api/payments
exports.getPayments = async (req, res, next) => {
  try {
    const { status, orderId } = req.query
    const filter = {}
    if (status) filter.status = status
    if (orderId) filter.order = orderId
    
    const payments = await Payment.find(filter)
      .populate('order')
      .populate('customer')
      .sort({ createdAt: -1 })
    res.json(payments)
  } catch (err) { next(err) }
}

// GET /api/payments/unpaid-alerts — delivered orders that are unpaid/partial
exports.getUnpaidAlerts = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: { $in: ['unpaid', 'partial'] } })
      .populate('order')
      .populate('customer')
      .sort({ createdAt: -1 })
    
    // Keep only payments where the order is delivered
    const alerts = payments.filter(p => p.order && p.order.status === 'delivered')
    res.json(alerts)
  } catch (err) { next(err) }
}

// PUT /api/payments/:id — payment status update
exports.updatePayment = async (req, res, next) => {
  try {
    const { status, transactionId, paidAmount, method, notes } = req.body
    
    const updateData = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === 'paid') {
        updateData.paidAt = new Date()
      } else if (status === 'unpaid') {
        updateData.paidAt = null
      }
    }
    if (transactionId !== undefined) updateData.transactionId = transactionId
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount
    if (method !== undefined) updateData.method = method
    if (notes !== undefined) updateData.notes = notes

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('order').populate('customer')
    res.json(payment)
  } catch (err) { next(err) }
}

