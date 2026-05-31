const Customer = require('../models/Customer')
const Order = require('../models/Order')

/**
 * calculateRiskScore — Order save এর আগে call করো
 * @param {Object} customer - Customer document from DB
 * @param {Object} order    - Order data from request
 * @returns {Promise<{ score, level, reasons }>}
 */
async function calculateRiskScore(customer, order) {
  // 1. Blacklist এ আছে → সরাসরি block, আর কিছু দেখার দরকার নেই
  if (customer && customer.blacklisted) {
    return { score: 100, level: 'blocked', reasons: ['কাস্টমার ব্ল্যাকলিস্টেড (Blocked)'] }
  }

  // গ্লোবাল ব্ল্যাকলিস্ট এবং ব্লকড ডিভাইস চেক (আগের সিস্টেমের ধারাবাহিকতা বজায় রাখতে)
  if (order.sharedBlock) {
    return { score: 100, level: 'blocked', reasons: ['গ্লোবাল ব্ল্যাকলিস্টেড নম্বর (Blocked)'] }
  }
  if (order.blockedDeviceOrder) {
    return { score: 100, level: 'blocked', reasons: ['ব্লকড ডিভাইস থেকে অর্ডার (Blocked)'] }
  }

  let score = 0
  const reasons = []

  // --- HIGH & MEDIUM RISK rules for returnCount ---
  if (customer) {
    if (customer.returnCount >= 5) {
      score += 60
      reasons.push(`রিটার্ন/ক্যান্সেল সংখ্যা ৫ বা তার বেশি (+60)`)
    } else if (customer.returnCount >= 3) {
      score += 40
      reasons.push(`রিটার্ন/ক্যান্সেল সংখ্যা ৩ বা তার বেশি (+40)`)
    } else if (customer.returnCount >= 2) {
      score += 30
      reasons.push(`রিটার্ন/ক্যান্সেল সংখ্যা ২ বা তার বেশি (+30)`)
    } else if (customer.returnCount === 1) {
      score += 15
      reasons.push(`১টি অর্ডার রিটার্ন/ক্যান্সেল হয়েছে (+15)`)
    }
  }

  // 3. একই phone থেকে ৩০ মিনিটের মধ্যে ৩+ order → +50
  const phone = order.phone || (customer && customer.phone)
  if (phone) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const recentOrdersCount = await Order.countDocuments({
      phone,
      createdAt: { $gte: thirtyMinutesAgo }
    })
    // যেহেতু বর্তমান অর্ডারটি ডেটাবেজে সেভ হয়নি, তাই আগের ২ বা তার বেশি অর্ডার থাকলেই এটি ৩+ হবে
    if (recentOrdersCount >= 2) {
      score += 50
      reasons.push(`৩০ মিনিটে ৩টি বা তার বেশি অর্ডার (+50)`)
    }
  }

  // 7. নতুন customer (totalOrders === 0) → +15
  const isNewCustomer = !customer || customer.totalOrders === 0
  if (isNewCustomer) {
    score += 15
    reasons.push(`নতুন কাস্টমার (+15)`)
  }

  // 8. COD + amount >= 3000 + নতুন customer → +25
  if (order.paymentMethod === 'COD' && order.totalAmount >= 3000 && isNewCustomer) {
    score += 25
    reasons.push(`COD + ৩০০০ টাকার বেশি অর্ডার + নতুন কাস্টমার (+25)`)
  }

  // --- LOW RISK adjustment ---
  if (customer) {
    if (customer.successOrders >= 5) {
      score -= 30
      reasons.push(`৫টির বেশি সফল অর্ডার (-30)`)
    } else if (customer.successOrders >= 3) {
      score -= 20
      reasons.push(`৩টির বেশি সফল অর্ডার (-20)`)
    }
  }

  // Score লিমিট নিশ্চিত করা (0 থেকে 100 এর মধ্যে)
  score = Math.min(100, Math.max(0, score))

  // Level নির্ধারণ
  let level = 'low'
  if (score === 100) {
    level = 'blocked'
  } else if (score >= 61) {
    level = 'high'
  } else if (score >= 31) {
    level = 'medium'
  } else {
    level = 'low'
  }

  return { score, level, reasons }
}

module.exports = { calculateRiskScore }
