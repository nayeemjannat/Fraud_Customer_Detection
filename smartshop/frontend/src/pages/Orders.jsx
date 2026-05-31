import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      let url = '/orders'
      if (statusFilter) {
        url += `?status=${statusFilter}`
      }
      const response = await api.get(url)
      setOrders(response.data)
    } catch (err) {
      console.error(err)
      setError('অর্ডার তালিকা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  // Filter orders by search term (local filtering for name/phone)
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      order.customerName.toLowerCase().includes(term) ||
      order.phone.includes(term) ||
      order.product.toLowerCase().includes(term)
    )
  })

  // Status mapping to Design Guide classes
  const statusConfig = {
    pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Shipped', classes: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Delivered', classes: 'bg-green-100 text-green-700' },
    returned: { label: 'Returned', classes: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600' },
  }

  // Risk Badge mapping to Design Guide classes
  const riskConfig = {
    low: { label: 'Low Risk', classes: 'bg-green-100 text-green-800 border border-green-200' },
    medium: { label: 'Medium', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    high: { label: 'High Risk!', classes: 'bg-red-100 text-red-800 border border-red-200' },
    blocked: { label: 'Blocked', classes: 'bg-gray-900 text-white' },
  }

  const paymentMethods = {
    COD: '💵 COD',
    bKash: '🌸 bKash',
    Nagad: '🍊 Nagad',
    Rocket: '🚀 Rocket',
    Partial: '⚖️ Partial'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">সব অর্ডার পরিচালনা ও অনুসন্ধান করুন।</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          ➕ নতুন Order যোগ করো
        </button>
      </div>

      {/* Stats Cards Row (4 Columns Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-white rounded-xl border-l-4 border-blue-500 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-1">সব মিলিয়ে মোট অর্ডার</p>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-xl border-l-4 border-yellow-500 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'pending').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">অপেক্ষমান অর্ডার সংখ্যা</p>
        </div>

        {/* Delivered Card */}
        <div className="bg-white rounded-xl border-l-4 border-green-500 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivered Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">সফলভাবে ডেলিভারি সম্পন্ন</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl border-l-4 border-indigo-600 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ৳{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">সর্বমোট বিক্রয়মূল্য</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />

          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              All ({orders.length})
            </button>
            {Object.keys(statusConfig).map(s => {
              const count = orders.filter(o => o.status === s).length
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Standard Table (C5) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-500 font-medium text-sm">অর্ডার লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium text-sm">
            ❌ {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3 bg-white">
            <span className="text-4xl">📭</span>
            <p className="text-gray-600 font-semibold text-base">কোনো অর্ডার পাওয়া যায়নি।</p>
            <p className="text-gray-400 text-xs max-w-sm">নতুন কোনো অর্ডার যোগ করতে উপরে 'নতুন Order যোগ করো' বাটনে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Risk
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const conf = statusConfig[order.status] || { label: order.status, classes: 'bg-slate-100 text-slate-500' }
                  const rsk = riskConfig[order.riskLevel] || { label: 'Low Risk', classes: 'bg-green-100 text-green-800 border border-green-200' }
                  
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Order ID */}
                      <td className="px-5 py-3.5 font-mono text-xs text-purple-600">
                        #{order._id.substring(order._id.length - 6)}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{order.phone}</div>
                      </td>

                      {/* Product Name & Qty */}
                      <td className="px-5 py-3.5 text-gray-700">
                        <div className="font-medium line-clamp-1">{order.product}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity}</div>
                      </td>

                      {/* Amount & Method */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">৳{order.totalAmount?.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{paymentMethods[order.paymentMethod] || order.paymentMethod}</div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conf.classes}`}>
                          {conf.label}
                        </span>
                      </td>

                      {/* Risk badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rsk.classes}`}>
                          {rsk.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          বিস্তারিত →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
