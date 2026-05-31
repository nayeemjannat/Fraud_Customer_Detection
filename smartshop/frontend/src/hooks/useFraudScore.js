import { useState, useEffect } from 'react'
import { calculateRiskScore } from '../utils/fraudEngine'

// Usage: const { score, level, reasons } = useFraudScore(customer, order)
export function useFraudScore(customer, order) {
  const [result, setResult] = useState({ score: 0, level: 'low', reasons: [] })
  useEffect(() => {
    if (!order) return
    setResult(calculateRiskScore(customer, order))
  }, [customer, order])
  return result
}
