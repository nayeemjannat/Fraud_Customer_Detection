import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
      
      // Fetch associated payment
      try {
        const payRes = await api.get(`/payments?orderId=${id}`)
        if (payRes.data && payRes.data.length > 0) {
          setPayment(payRes.data[0])
        }
      } catch (payErr) {
        console.error('Payment fetch failed', payErr)
      }
    } catch (err) {
      console.error(err)
      setError('অর্ডারের বিস্তারিত লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    setError('')
    setUpdateSuccess('')
    try {
      const response = await api.put(`/orders/${id}/status`, { status: newStatus })
      setOrder(response.data)
      setUpdateSuccess('অর্ডারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!')
      setTimeout(() => setUpdateSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!payment) return
    setUpdating(true)
    setError('')
    setUpdateSuccess('')
    try {
      const response = await api.put(`/payments/${payment._id}`, {
        status: 'paid',
        paidAmount: order.totalAmount
      })
      setPayment(response.data)
      setUpdateSuccess('পেমেন্ট সফলভাবে পেইড হিসেবে চিহ্নিত করা হয়েছে!')
      setTimeout(() => setUpdateSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('পেমেন্ট আপডেট করতে সমস্যা হয়েছে।')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium text-sm">অর্ডারের তথ্য লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <p className="text-red-500 text-lg font-bold">❌ {error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
        >
          অর্ডার তালিকায় ফিরে যান
        </button>
      </div>
    )
  }

  // Design Guide Status Configuration
  const statusConfig = {
    pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Shipped', classes: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Delivered', classes: 'bg-green-100 text-green-700' },
    returned: { label: 'Returned', classes: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600' },
  }

  const currentStatusConf = statusConfig[order.status] || { label: order.status, classes: 'bg-gray-100 text-gray-600' }

  // Design Guide Risk Configuration
  const riskConfig = {
    low: { label: 'Low Risk', classes: 'bg-green-100 text-green-800 border border-green-200' },
    medium: { label: 'Medium Risk', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    high: { label: 'High Risk!', classes: 'bg-red-100 text-red-800 border border-red-200' },
    blocked: { label: 'Blocked', classes: 'bg-gray-900 text-white' }
  }

  const rsk = riskConfig[order.riskLevel] || { label: 'Low Risk', classes: 'bg-green-100 text-green-800 border border-green-200' }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Print settings styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-print-area, #invoice-print-area * {
              visibility: visible;
            }
            #invoice-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Page Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 border border-gray-200 bg-white"
            title="পেছনে যান"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">অর্ডারের বিস্তারিত তথ্য</h1>
            <p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-mono">{order._id}</span></p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          🖨️ ইনভয়েস প্রিন্ট
        </button>
      </div>

      {updateSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium no-print">
          ✨ {updateSuccess}
        </div>
      )}

      {/* Grid Layout: Invoice on Left, Actions/Risk on Right */}
      <div id="invoice-print-area" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice Page Container (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Invoice Card (C2 Standard Card) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            
            {/* Header Details */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-wider">SMARTSHOP INVOICE</h2>
                <p className="text-xs text-gray-400 mt-1">
                  তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusConf.classes}`}>
                {currentStatusConf.label}
              </span>
            </div>

            {/* Customer & Billing Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">ডেলিভারি ঠিকানা</span>
                <p className="font-bold text-gray-800 text-base">{order.customerName}</p>
                <p className="text-gray-600 font-mono">{order.phone}</p>
                <p className="text-gray-500 mt-1 leading-relaxed">{order.address}</p>
              </div>
              <div className="space-y-1 md:text-right">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">পেমেন্টের বিবরণ</span>
                <p className="font-bold text-gray-800">পেমেন্ট মেথড: {payment?.method || order.paymentMethod}</p>
                {payment && (
                  <p className="text-xs font-medium mt-1">
                    স্ট্যাটাস: {' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </p>
                )}
                {payment?.transactionId && (
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">TxID: {payment.transactionId}</p>
                )}
                {payment && payment.paidAmount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">পরিশোধিত: ৳{payment.paidAmount}</p>
                )}
              </div>

            </div>

            {/* Items Table */}
            <div className="border border-gray-100 rounded-lg overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">পণ্যের নাম</th>
                    <th className="px-4 py-3 text-center">পরিমাণ</th>
                    <th className="px-4 py-3 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                  <tr>
                    <td className="px-4 py-3.5 text-gray-900 font-semibold">{order.product}</td>
                    <td className="px-4 py-3.5 text-center">{order.quantity}</td>
                    <td className="px-4 py-3.5 text-right">৳{(order.totalAmount / order.quantity || 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtotal calculation */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-sm font-medium">
                <div className="flex justify-between text-gray-500">
                  <span>সাবটোটাল</span>
                  <span>৳{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 border-b border-gray-100 pb-2">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳0.00</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-base pt-1">
                  <span>সর্বমোট বিল</span>
                  <span className="text-blue-600">৳{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
                <p className="font-semibold uppercase tracking-wider mb-1">অতিরিক্ত নোট:</p>
                <p>{order.notes}</p>
              </div>
            )}

          </div>

          {/* Risk Analysis details on Left side (Design Guide compliant) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 no-print">
            <h3 className="font-semibold text-gray-700">Risk Analysis</h3>
            
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rsk.classes}`}>
                {rsk.label}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                ঝুঁকি স্কোর: <span className="font-bold text-gray-800">{order.riskScore}%</span>
              </span>
            </div>

            {order.riskReasons && order.riskReasons.length > 0 ? (
              <div className="space-y-1.5 mt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">ঝুঁকির কারণসমূহ</p>
                <ul className="text-xs text-red-600 space-y-1 bg-red-50 border border-red-200 rounded-xl p-4">
                  {order.riskReasons.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-700">✅ এই অর্ডারে কোনো ঝুঁকিপূর্ণ ফ্যাক্টর নেই।</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions / Status Panel (col-span-1) no-print */}
        <div className="lg:col-span-1 space-y-4 no-print">
          
          {/* Payment Actions Card */}
          {payment && payment.status !== 'paid' && order.status === 'delivered' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-amber-800 flex items-center gap-1.5 text-sm">
                <span>💰</span> পেমেন্ট সংগ্রহ করুন
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                অর্ডারটি সফলভাবে ডেলিভার করা হয়েছে কিন্তু পেমেন্ট এখনো পরিশোধ করা হয়নি। টাকা পেয়ে থাকলে পেইড মার্ক করুন।
              </p>
              <button
                onClick={handleMarkAsPaid}
                disabled={updating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>💵</span> টাকা পেয়েছি (Mark as Paid)
              </button>
            </div>
          )}

          {/* Status Controls */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-700 pb-2 border-b border-gray-100">স্ট্যাটাস পরিবর্তন</h3>
            
            <div className="flex flex-col gap-2">
              {Object.keys(statusConfig).map((statusKey) => {
                const config = statusConfig[statusKey]
                const isActive = order.status === statusKey
                return (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(statusKey)}
                    disabled={updating || isActive}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left border flex items-center justify-between ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold border-blue-200'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 disabled:opacity-50'
                    }`}
                  >
                    <span>{config.label}</span>
                    {isActive && <span className="text-xs text-blue-600">✓ Active</span>}
                  </button>
                )
              })}
            </div>
            {updating && (
              <p className="text-xs text-gray-400 text-center animate-pulse">আপডেট হচ্ছে...</p>
            )}
          </div>

          {/* Sidebar guidelines card (Stats guidelines) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-700">💡 স্ট্যাটাস গাইডলাইন:</p>
            <p>• <span className="font-bold text-yellow-600">Pending:</span> অর্ডার প্রস্তুত হচ্ছে।</p>
            <p>• <span className="font-bold text-blue-600">Confirmed:</span> অর্ডার কনফার্ম হয়েছে।</p>
            <p>• <span className="font-bold text-purple-600">Shipped:</span> কুরিয়ারে পাঠানো হয়েছে।</p>
            <p>• <span className="font-bold text-green-600">Delivered:</span> ডেলিভারি সম্পূর্ণ হয়েছে।</p>
          </div>
        </div>

      </div>
    </div>
  )
}
