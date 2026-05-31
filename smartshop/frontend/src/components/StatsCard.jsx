/**
 * StatsCard — Dashboard এর number card
 * Props: title, value, subtitle, color ('blue'|'green'|'red'|'yellow')
 */
export default function StatsCard({ title, value, subtitle, color = 'blue' }) {
  const colors = {
    blue:   'border-blue-500 bg-blue-50',
    green:  'border-green-500 bg-green-50',
    red:    'border-red-500 bg-red-50',
    yellow: 'border-yellow-500 bg-yellow-50',
  }

  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${colors[color]}`}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
