import { useState, useEffect } from 'react'
import api from '../api/axiosInstance'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [alerts, setAlerts] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [modalMethod, setModalMethod] = useState('COD')
  const [modalStatus, setModalStatus] = useState('unpaid')
  const [modalTxId, setModalTxId] = useState('')
  const [modalPaidAmount, setModalPaidAmount] = useState('')
  const [modalNotes, setModalNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [payRes, alertRes, summaryRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/unpaid-alerts'),
        api.get('/analytics/monthly-summary')
      ])
      setPayments(payRes.data)
      setAlerts(alertRes.data)
      setMonthlySummary(summaryRes.data)
    } catch (err) {
      console.error(err)
      setError('পেমেন্ট ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  // Refetch alerts and summary after changes
  const refetchPaymentsAndAlerts = async () => {
    try {
      const [payRes, alertRes, summaryRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/unpaid-alerts'),
        api.get('/analytics/monthly-summary')
      ])
      setPayments(payRes.data)
      setAlerts(alertRes.data)
      setMonthlySummary(summaryRes.data)
    } catch (err) {
      console.error('Refetch failed', err)
    }
  }

  // Quick mark COD as Paid
  const handleQuickMarkPaid = async (paymentId, totalAmount) => {
    setError('')
    setSuccess('')
    try {
      await api.put(`/payments/${paymentId}`, {
        status: 'paid',
        paidAmount: totalAmount
      })
      setSuccess('অর্ডার পেমেন্ট সফলভাবে সম্পন্ন করা হয়েছে!')
      await refetchPaymentsAndAlerts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('পেমেন্ট আপডেট করতে ব্যর্থ হয়েছে।')
    }
  }

  // Open Edit Modal
  const openEditModal = (payment) => {
    setSelectedPayment(payment)
    setModalMethod(payment.method || 'COD')
    setModalStatus(payment.status || 'unpaid')
    setModalTxId(payment.transactionId || '')
    setModalPaidAmount(payment.paidAmount || 0)
    setModalNotes(payment.notes || '')
    setIsEditModalOpen(true)
  }

  // Submit Edit Modal
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPayment) return
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      await api.put(`/payments/${selectedPayment._id}`, {
        method: modalMethod,
        status: modalStatus,
        transactionId: modalTxId.trim(),
        paidAmount: parseFloat(modalPaidAmount) || 0,
        notes: modalNotes.trim()
      })
      setSuccess('পেমেন্টের বিবরণ সফলভাবে আপডেট করা হয়েছে!')
      setIsEditModalOpen(false)
      await refetchPaymentsAndAlerts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('পেমেন্ট আপডেট সংরক্ষণ করতে সমস্যা হয়েছে।')
    } finally {
      setUpdating(false)
    }
  }

  // Local filtering
  const filteredPayments = payments.filter(p => {
    const orderIdMatch = p.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const customerMatch = p.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.customer?.phone?.includes(searchTerm) || false
    const txIdMatch = p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    
    const searchMatch = !searchTerm || orderIdMatch || customerMatch || txIdMatch
    const statusMatch = !statusFilter || p.status === statusFilter
    const methodMatch = !methodFilter || p.method === methodFilter

    return searchMatch && statusMatch && methodMatch
  })

  // Calculations for stats
  const totalCollected = payments.reduce((sum, p) => p.status === 'paid' || p.status === 'partial' ? sum + (p.paidAmount || 0) : sum, 0)
  const totalOutstanding = payments.reduce((sum, p) => p.status !== 'paid' && p.status !== 'refunded' ? sum + (p.amount - (p.paidAmount || 0)) : sum, 0)
  const totalRefunded = payments.reduce((sum, p) => p.status === 'refunded' ? sum + (p.amount || 0) : sum, 0)

  // Status mapping
  const statusConfig = {
    unpaid: { label: 'Unpaid', classes: 'bg-red-50 text-red-700 border-red-100' },
    partial: { label: 'Partial', classes: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    paid: { label: 'Paid', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    refunded: { label: 'Refunded', classes: 'bg-gray-50 text-gray-500 border-gray-100' },
  }

  const paymentMethods = {
    COD: '💵 Cash On Delivery (COD)',
    bKash: '🌸 bKash',
    Nagad: '🍊 Nagad',
    Rocket: '🚀 Rocket'
  }

  // Month names helper
  const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">সব ধরনের বিলিং, পেমেন্ট অ্যাকাউন্ট এবং ক্যাশ-ইন রসিদ পরিচালনা করুন।</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium animate-bounce">
          ✨ {success}
        </div>
      )}

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">সর্বমোট সংগৃহীত পেমেন্ট</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">৳{totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">সফল ক্যাশ-ইন মোট পরিমাণ</p>
          </div>
          <span className="text-3xl bg-emerald-50 p-3 rounded-xl">💰</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">অনাদায়ী পাওনা বিল</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">৳{totalOutstanding.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">বাকি/আংশিক বকেয়া পেমেন্ট</p>
          </div>
          <span className="text-3xl bg-amber-50 p-3 rounded-xl">⚖️</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">মোট রিফান্ড পরিমাণ</p>
            <p className="text-3xl font-extrabold text-slate-500 mt-1">৳{totalRefunded.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">কাস্টমারকে ফেরত দেওয়া অর্থ</p>
          </div>
          <span className="text-3xl bg-slate-50 p-3 rounded-xl">🔄</span>
        </div>
      </div>

      {/* Alert Section: Unpaid Delivered Orders (High Priority Alerts) */}
      {alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-3.5 shadow-sm">
          <h2 className="text-sm font-bold text-rose-800 flex items-center gap-2">
            <span className="animate-ping w-2.5 h-2.5 bg-rose-600 rounded-full"></span>
            <span>⚠️ পেমেন্ট সতর্কবার্তা: পণ্য ডেলিভার করা হয়েছে কিন্তু মূল্য পরিশোধ করা হয়নি ({alerts.length} টি)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {alerts.map(al => (
              <div key={al._id} className="bg-white border border-rose-100 rounded-lg p-3.5 space-y-2.5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                      #{al.order?._id ? al.order._id.substring(al.order._id.length - 6) : 'N/A'}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                      DELIVERED BUT UNPAID
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 text-xs mt-1.5">{al.customer?.name || al.order?.customerName}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{al.customer?.phone || al.order?.phone}</p>
                  <p className="text-xs text-gray-800 font-extrabold mt-1">পেমেন্ট বিল: ৳{al.amount}</p>
                </div>
                <button
                  onClick={() => handleQuickMarkPaid(al._id, al.amount)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1"
                >
                  💵 টাকা পেয়েছি (Mark Paid)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <input
          placeholder="Search by order ID, name, phone, transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto"
          >
            <option value="">All Methods</option>
            <option value="COD">COD (💵)</option>
            <option value="bKash">bKash (🌸)</option>
            <option value="Nagad">Nagad (🍊)</option>
            <option value="Rocket">Rocket (🚀)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-500 font-medium text-sm">পেমেন্ট হিস্ট্রি লোড হচ্ছে...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3 bg-white">
            <span className="text-4xl">💰</span>
            <p className="text-gray-600 font-semibold text-base">কোনো পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Order ID</th>
                  <th className="text-left px-5 py-3.5">গ্রাহকের বিবরণ</th>
                  <th className="text-left px-5 py-3.5">মেথড</th>
                  <th className="text-center px-5 py-3.5">স্ট্যাটাস</th>
                  <th className="text-right px-5 py-3.5">মোট বিল</th>
                  <th className="text-right px-5 py-3.5">পরিশোধিত</th>
                  <th className="text-left px-5 py-3.5">TxID</th>
                  <th className="text-center px-5 py-3.5">তারিখ</th>
                  <th className="text-right px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map(p => {
                  const st = statusConfig[p.status] || { label: p.status, classes: 'bg-gray-100 text-gray-500 border-gray-200' }
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      {/* Order ID Link */}
                      <td className="px-5 py-3.5 font-mono text-xs text-purple-600 font-bold">
                        #{p.order?._id ? p.order._id.substring(p.order._id.length - 6) : 'N/A'}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{p.customer?.name || p.order?.customerName || 'N/A'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.customer?.phone || p.order?.phone || '—'}</div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-3.5 font-semibold text-gray-700 text-xs">
                        {p.method}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.classes}`}>
                          {st.label}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-3.5 text-right font-extrabold text-gray-800">
                        ৳{p.amount?.toLocaleString('en-IN')}
                      </td>

                      {/* Paid Amount */}
                      <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">
                        ৳{p.paidAmount?.toLocaleString('en-IN') || 0}
                      </td>

                      {/* TxID */}
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                        {p.transactionId || '—'}
                      </td>

                      {/* Paid At / Created Date */}
                      <td className="px-5 py-3.5 text-center text-xs text-gray-400">
                        {new Date(p.updatedAt).toLocaleDateString('bn-BD', { dateStyle: 'medium' })}
                      </td>

                      {/* Update Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold border border-blue-200 hover:border-blue-300 rounded px-2.5 py-1 bg-white hover:bg-blue-50 transition-all shadow-2xs"
                        >
                          আপডেট ⚙️
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

      {/* Aggregate Monthly Summary (F4 Step 5) */}
      {monthlySummary.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <span>📈</span> মাসিক পেমেন্ট রিপোর্ট (Aggregated Summary)
          </h2>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider text-left">
                  <th className="px-4 py-3">মাস / বছর</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center">অর্ডার সংখ্যা</th>
                  <th className="px-4 py-3 text-right">মোট অ্যামাউন্ট</th>
                  <th className="px-4 py-3 text-right">মোট সংগৃহীত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {monthlySummary.map((sum, index) => {
                  const mName = bnMonths[sum.month - 1] || `Month ${sum.month}`
                  const st = statusConfig[sum.status] || { label: sum.status, classes: 'bg-gray-100 text-gray-500' }
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900">{mName}, {sum.year}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${st.classes}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-800">{sum.count} টি</td>
                      <td className="px-4 py-3.5 text-right font-extrabold">৳{sum.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-600">৳{sum.totalPaid?.toLocaleString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* manual payment updates Modal (C2 Modal Dialog) */}
      {isEditModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-slideUp">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">পেমেন্ট তথ্য আপডেট করুন</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">Payment ID: {selectedPayment._id}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-medium">
              {/* Payment Bill Info */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-gray-400">গ্রাহক:</span>
                  <span className="font-bold text-gray-800">{selectedPayment.customer?.name || selectedPayment.order?.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">মোট বিল অ্যামাউন্ট:</span>
                  <span className="font-bold text-gray-900">৳{selectedPayment.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Method */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-bold">পেমেন্ট মেথড:</label>
                <select
                  value={modalMethod}
                  onChange={(e) => setModalMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="COD">COD (Cash on Delivery)</option>
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-bold">পেমেন্ট স্ট্যাটাস:</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="unpaid">Unpaid (পরিশোধিত নয়)</option>
                  <option value="partial">Partial (আংশিক পরিশোধিত)</option>
                  <option value="paid">Paid (সম্পূর্ণ পরিশোধিত)</option>
                  <option value="refunded">Refunded (টাকা ফেরত দেওয়া হয়েছে)</option>
                </select>
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-bold">Transaction ID (বিকাশ/নগদ/রকেট আইডি):</label>
                <input
                  type="text"
                  value={modalTxId}
                  onChange={(e) => setModalTxId(e.target.value)}
                  placeholder="যেমন: TRX12345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Paid Amount */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-bold">পরিশোধিত পরিমাণ (Paid Amount):</label>
                <input
                  type="number"
                  min="0"
                  max={selectedPayment.amount}
                  value={modalPaidAmount}
                  onChange={(e) => setModalPaidAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-gray-700 font-bold">বিশেষ মন্তব্য/নোট:</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="যেমন: বিকাশে পেমেন্ট ভেরিফাই করা হয়েছে।"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center"
                >
                  {updating ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
