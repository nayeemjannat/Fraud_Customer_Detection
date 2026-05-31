const Order   = require('../models/Order')
const Payment = require('../models/Payment')

// GET /api/analytics/summary — Dashboard এর stats
exports.getSummary = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Today's orders count
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } })

    // Total orders count
    const totalOrders = await Order.countDocuments()

    // Returns count
    const totalReturns = await Order.countDocuments({ status: 'returned' })

    // High risk orders count
    const highRiskOrders = await Order.countDocuments({ riskLevel: { $in: ['high', 'blocked'] } })

    // Total revenue (sum of totalAmount for all non-cancelled, non-returned orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    // Savings: Sum of totalAmount for all blocked orders
    const savingsResult = await Order.aggregate([
      { $match: { riskLevel: 'blocked' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
    const savings = savingsResult.length > 0 ? savingsResult[0].total : 0

    // Top 5 products
    const topProducts = await Order.aggregate([
      { $group: { _id: "$product", count: { $sum: "$quantity" }, total: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    res.json({
      todayOrders,
      totalOrders,
      totalReturns,
      highRiskOrders,
      totalRevenue,
      savings,
      topProducts
    })
  } catch (err) { next(err) }
}

// GET /api/analytics/weekly — Last 7 days chart data
exports.getWeekly = async (req, res, next) => {
  try {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      const count = await Order.countDocuments({ createdAt: { $gte: date, $lt: nextDate } })
      days.push({ date: date.toLocaleDateString('bn-BD'), orders: count })
    }
    res.json(days)
  } catch (err) { next(err) }
}

// GET /api/analytics/monthly-summary — Aggregated payments by month and status
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const summary = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          status: "$_id.status",
          totalAmount: 1,
          totalPaid: 1,
          count: 1
        }
      },
      { $sort: { year: -1, month: -1, status: 1 } }
    ])
    res.json(summary)
  } catch (err) { next(err) }
}

