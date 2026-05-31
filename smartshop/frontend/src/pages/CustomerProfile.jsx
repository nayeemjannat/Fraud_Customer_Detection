import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function CustomerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [id])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/customers/${id}`)
      setData(response.data)
      setBlacklistReason(response.data.customer.blacklistReason || '')
    } catch (err) {
      console.error(err)
      setError('গ্রাহকের প্রোফাইল লোড করতে ব্যর্থ হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlacklist = async () => {
    if (!data) return
    const isBlacklisted = data.customer.blacklisted

    // If we are blacklisting and haven't shown reason input yet, show it first
    if (!isBlacklisted && !showReasonInput) {
      setShowReasonInput(true)
      return
    }

    setToggling(true)
    setError('')
    try {
      const response = await api.put(`/customers/${id}/blacklist`, {
        blacklisted: !isBlacklisted,
        reason: !isBlacklisted ? blacklistReason : ''
      })
      
      // Update local state customer
      setData(prev => ({
        ...prev,
        customer: response.data
      }))
      
      setShowReasonInput(false)
      if (isBlacklisted) setBlacklistReason('')
    } catch (err) {
      console.error(err)
      setError('ব্ল্যাকলিস্ট আপডেট করতে ব্যর্থ হয়েছে।')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium text-sm">প্রোফাইল লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <p className="text-red-500 text-lg font-bold">❌ {error}</p>
        <button
          onClick={() => navigate('/customers')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
        >
          গ্রাহক তালিকায় ফিরে যান
        </button>
      </div>
    )
  }

  const { customer, orders, reliabilityScore } = data
  const firstLetter = customer.name.charAt(0).toUpperCase()

  // Reliability badge mapping
  let reliabilityBadge = 'bg-gray-100 text-gray-600'
  if (customer.totalOrders > 0) {
    if (reliabilityScore >= 80) reliabilityBadge = 'bg-green-100 text-green-800'
    else if (reliabilityScore >= 50) reliabilityBadge = 'bg-yellow-100 text-yellow-800'
    else reliabilityBadge = 'bg-red-100 text-red-800'
  }

  // Order status configuration
  const statusConfig = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    returned: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  // Risk Badge config
  const riskConfig = {
    low: 'bg-green-100 text-green-800 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    high: 'bg-red-100 text-red-800 border border-red-200',
    blocked: 'bg-gray-900 text-white',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Navigation Header */}
      <div className="flex items-center gap-3 no-print">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 border border-gray-200 bg-white"
          title="পেছনে যান"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">সব অর্ডার ও রিয়েল-টাইম হিস্ট্রি ট্র্যাক করুন।</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Main Profile Header Card (P4) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar circle */}
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">{firstLetter}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                {customer.blacklisted && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-white">
                    🚫 Blacklisted
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-mono mt-0.5">{customer.phone}</p>
              <p className="text-xs text-gray-400 mt-1">ঠিকানা: {customer.address || 'কোনো তথ্য নেই'}</p>
              {customer.blacklisted && customer.blacklistReason && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg mt-2 font-medium">
                  <strong>কারণ:</strong> {customer.blacklistReason}
                </div>
              )}
            </div>
          </div>

          {/* Blacklist Control Button */}
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <button
              onClick={handleToggleBlacklist}
              disabled={toggling}
              className={`text-sm px-4 py-2 rounded-lg font-medium border transition-colors w-full md:w-auto text-center ${
                customer.blacklisted
                  ? 'text-green-600 border-green-200 hover:bg-green-50'
                  : 'text-red-500 border-red-200 hover:bg-red-50'
              }`}
            >
              {toggling
                ? 'আপডেট হচ্ছে...'
                : customer.blacklisted
                ? 'Whitelist করো (Remove Block)'
                : 'Blacklist করো (Block Customer)'}
            </button>

            {/* Blacklist Reason Input */}
            {showReasonInput && (
              <div className="w-full md:w-64 bg-slate-50 border border-gray-200 rounded-lg p-3 space-y-2.5 animate-fadeIn">
                <label className="block text-xs font-bold text-gray-600">ব্ল্যাকলিস্ট করার কারণ দিন:</label>
                <input
                  type="text"
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="যেমন: ৩ বার ফেক অর্ডার দিয়েছে"
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowReasonInput(false)}
                    className="px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleBlacklist}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    Confirm Block
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row (4 Columns Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 text-center">
          <div className="py-2">
            <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
          </div>
          <div className="py-2">
            <p className="text-2xl font-bold text-green-600">{customer.successOrders}</p>
            <p className="text-xs text-gray-500 font-medium">Delivered</p>
          </div>
          <div className="py-2">
            <p className="text-2xl font-bold text-red-500">{customer.returnCount}</p>
            <p className="text-xs text-gray-500 font-medium">Returned</p>
          </div>
          <div className="py-2">
            <p className={`text-2xl font-bold inline-flex px-3 py-0.5 rounded-full ${reliabilityBadge}`}>
              {customer.totalOrders > 0 ? `${reliabilityScore}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">Reliability Score</p>
          </div>
        </div>
      </div>

      {/* Section: Customer Order History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">Order History</h2>
        
        {/* Order list Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              ℹ️ এই গ্রাহকের কোনো অর্ডারের ইতিহাস নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    <th className="text-left px-5 py-3.5">Order ID</th>
                    <th className="text-left px-5 py-3.5">Product</th>
                    <th className="text-left px-5 py-3.5">Amount</th>
                    <th className="text-left px-5 py-3.5">Status</th>
                    <th className="text-left px-5 py-3.5">Risk Score</th>
                    <th className="text-left px-5 py-3.5">Order Date</th>
                    <th className="text-right px-5 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                  {orders.map(order => {
                    const stColor = statusConfig[order.status] || 'bg-gray-100 text-gray-600'
                    const riskStyle = riskConfig[order.riskLevel] || 'bg-gray-100 text-gray-500'

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

                        {/* Product Name */}
                        <td className="px-5 py-3.5 text-gray-900 font-semibold truncate max-w-xs">
                          {order.product} {order.quantity > 1 && `× ${order.quantity}`}
                        </td>

                        {/* Total Amount */}
                        <td className="px-5 py-3.5 text-gray-800 font-bold">
                          ৳{order.totalAmount?.toLocaleString('en-IN')}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stColor}`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Risk score badge */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${riskStyle}`}>
                            {order.riskLevel} ({order.riskScore}%)
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'medium' })}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
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
    </div>
  )
}
