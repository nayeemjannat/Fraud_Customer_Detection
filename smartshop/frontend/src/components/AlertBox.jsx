/**
 * AlertBox — Suspicious order এলে warning দেখায়
 * Props: message (string), type ('warning'|'error'|'info')
 */
export default function AlertBox({ message, type = 'warning' }) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    info:    'bg-blue-50 border-blue-400 text-blue-800',
  }

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${styles[type]}`}>
      <p className="font-semibold">সতর্কতা!</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  )
}
