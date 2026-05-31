/**
 * RiskBadge — Risk score অনুযায়ী রঙিন badge দেখায়
 * Props: score (number), level ('low'|'medium'|'high'|'blocked')
 */
export default function RiskBadge({ score, level }) {
  const styles = {
    low:     'bg-green-100 text-green-800 border-green-300',
    medium:  'bg-yellow-100 text-yellow-800 border-yellow-300',
    high:    'bg-red-100 text-red-800 border-red-300',
    blocked: 'bg-gray-900 text-white border-gray-700',
  }
  const labels = { low: 'Low Risk', medium: 'সন্দেহজনক', high: 'High Risk!', blocked: 'Blocked' }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${styles[level] || styles.low}`}>
      {/* TODO: icon যোগ করো */}
      {labels[level]} {score !== undefined && `(${score})`}
    </span>
  )
}
