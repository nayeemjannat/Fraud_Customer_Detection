import RiskBadge from './RiskBadge'

/**
 * OrderCard — Order list এ একটি order দেখায়
 * Props: order (object), onClick (function)
 */
export default function OrderCard({ order, onClick }) {
  const statusColors = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    returned:  'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-800">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
          <p className="text-xs text-gray-400 mt-1">{order.product} × {order.quantity}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || statusColors.pending}`}>
            {order.status}
          </span>
          {order.riskLevel && <RiskBadge score={order.riskScore} level={order.riskLevel} />}
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-700">৳{order.totalAmount}</span>
        <span className="text-xs text-gray-400">{order.paymentMethod}</span>
      </div>
    </div>
  )
}
