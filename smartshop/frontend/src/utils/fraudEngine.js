/**
 * fraudEngine.js — Fake Order Detection
 * Score: 0-30 Low | 31-60 Medium | 61-99 High | 100 Blocked
 */
export function calculateRiskScore(customer, order) {
  let score = 0
  const reasons = []

  if (!customer || customer.totalOrders === 0) {
    score += 25
    reasons.push('নতুন customer (+25)')
  }

  if (customer?.blacklisted) {
    return { score: 100, level: 'blocked', reasons: ['Blacklist এ আছে'] }
  }

  if (customer?.returnCount >= 2) {
    score += 35
    reasons.push(customer.returnCount + ' বার return (+35)')
  } else if (customer?.returnCount === 1) {
    score += 15
    reasons.push('১ বার return (+15)')
  }

  if (order?.paymentMethod === 'COD' && order?.totalAmount >= 2000 && customer?.totalOrders < 2) {
    score += 30
    reasons.push('COD + 2000tk+ + নতুন customer (+30)')
  }

  if (customer?.successOrders >= 3) {
    score -= 20
    reasons.push(customer.successOrders + ' সফল order (-20)')
  }

  score = Math.min(100, Math.max(0, score))
  const level = score > 60 ? 'high' : score > 30 ? 'medium' : 'low'
  return { score, level, reasons }
}

export function getRiskColor(level) {
  return { low: 'green', medium: 'yellow', high: 'red', blocked: 'black' }[level] || 'gray'
}
