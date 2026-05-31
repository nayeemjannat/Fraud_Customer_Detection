import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import { useFraudScore } from '../hooks/useFraudScore'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export default function NewOrder() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [notes, setNotes] = useState('')
  const [deviceId, setDeviceId] = useState('')

  // Customer states (from auto-search)
  const [foundCustomer, setFoundCustomer] = useState(null)

  // Get Visitor ID (Device Fingerprint) on mount
  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        setDeviceId(result.visitorId)
      } catch (err) {
        console.error('FingerprintJS load failed', err)
      }
    }
    loadFingerprint()
  }, [])

  // Auto-search customer when phone is 11 digits
  useEffect(() => {
    const searchPhone = phone.trim()
    if (/^01[3-9]\d{8}$/.test(searchPhone)) {
      api.get(`/customers?search=${searchPhone}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            const cust = res.data.find(c => c.phone === searchPhone)
            if (cust) {
              setFoundCustomer(cust)
              // If customer exists, auto-fill name and address if they are empty
              if (!customerName) setCustomerName(cust.name)
              if (!address) setAddress(cust.address)
            } else {
              setFoundCustomer(null)
            }
          } else {
            setFoundCustomer(null)
          }
        })
        .catch(err => {
          console.error('Customer search failed', err)
          setFoundCustomer(null)
        })
    } else {
      setFoundCustomer(null)
    }
  }, [phone])

  const totalAmount = quantity * (parseFloat(pricePerUnit) || 0)

  // Use hook to calculate real-time score
  const { score, level, reasons } = useFraudScore(foundCustomer, { paymentMethod, totalAmount })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Basic validation
    if (!customerName || !phone || !address || !product || !pricePerUnit) {
      setError('অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।')
      setLoading(false)
      return
    }

    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      setError('সভ্য বাংলাদেশি নম্বর দিন (যেমন: 01712345678)।')
      setLoading(false)
      return
    }

    try {
      const orderData = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        product: product.trim(),
        quantity: parseInt(quantity),
        totalAmount,
        paymentMethod,
        notes: notes.trim(),
        deviceId
      }

      await api.post('/orders', orderData)
      setSuccess('অর্ডারটি সফলভাবে তৈরি করা হয়েছে!')
      
      // Reset form
      setCustomerName('')
      setPhone('')
      setAddress('')
      setProduct('')
      setQuantity(1)
      setPricePerUnit('')
      setPaymentMethod('COD')
      setNotes('')
      setFoundCustomer(null)

      setTimeout(() => {
        navigate('/orders')
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'অর্ডার তৈরি করতে সমস্যা হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  // Risk display configuration from UI design guide
  const riskDisplay = {
    low: { border: 'border-green-400', text: 'text-green-600', label: 'Low Risk' },
    medium: { border: 'border-yellow-400', text: 'text-yellow-600', label: 'Medium Risk' },
    high: { border: 'border-red-400', text: 'text-red-600', label: 'High Risk!' },
    blocked: { border: 'border-gray-800', text: 'text-gray-900', label: 'Blocked' },
  }
  const currentRisk = riskDisplay[level] || riskDisplay.low

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">নতুন কাস্টমার অথবা এক্সিস্টিং কাস্টমারের জন্য অর্ডার যোগ করুন।</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium">
          ✨ {success}
        </div>
      )}

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Form (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">নতুন Order যোগ করো</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Customer Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Customer তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    required
                  />
                  {foundCustomer && (
                    <p className="text-[11px] text-green-600 font-medium">
                      ✓ এক্সিস্টিং কাস্টমার পাওয়া গেছে ({foundCustomer.name})
                    </p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="নাম লেখো"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="যেমন: সেক্টর ৭, উত্তরা, ঢাকা।"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Section: Order Details */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Order বিবরণ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Name */}
                <div className="space-y-1 md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    পণ্যের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="যেমন: Premium Leather Wallet"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    পরিমাণ (Quantity) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    required
                  />
                </div>

                {/* Price Per Unit */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    একক মূল্য <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      required
                    />
                  </div>
                </div>

                {/* Calculated Total Amount */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    সর্বমোট বিল
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 h-9 flex items-center">
                    ৳{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                পেমেন্ট মেথড
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="COD">💵 Cash On Delivery (COD)</option>
                <option value="bKash">🌸 bKash (বিকাশ)</option>
                <option value="Nagad">🍊 Nagad (নগদ)</option>
                <option value="Rocket">🚀 Rocket (রকেট)</option>
                <option value="Partial">⚖️ Partial Payment (আংশিক)</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                বিশেষ নোট (ঐচ্ছিক)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="অর্ডারের কোনো বিশেষ নোট থাকলে এখানে লিখুন..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  অর্ডার সংরক্ষণ করা হচ্ছে...
                </>
              ) : (
                'Order Save করো'
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Sticky Risk Analysis Panel (col-span-1) */}
        <div className="lg:col-span-1 space-y-4 sticky top-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-700">Risk Analysis</h3>
            
            {/* Big Risk Score Circle */}
            <div className="flex flex-col items-center py-4 border-b border-gray-50">
              <div className={`w-24 h-24 rounded-full border-4 ${currentRisk.border} flex items-center justify-center transition-all duration-300`}>
                <span className={`text-3xl font-bold ${currentRisk.text}`}>{score}</span>
              </div>
              <p className={`mt-2 text-sm font-medium ${currentRisk.text}`}>{currentRisk.label}</p>
            </div>

            {/* Reasons List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">ঝুঁকির কারণসমূহ</p>
              {reasons.length > 0 ? (
                <ul className="text-xs text-gray-600 space-y-1.5 font-medium">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <span>•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-green-600 bg-green-50 px-2.5 py-2 rounded-lg font-medium">
                  ✅ কোনো ঝুঁকিপূর্ণ ফ্যাক্টর সনাক্ত করা যায়নি।
                </p>
              )}
            </div>
          </div>

          {/* Alert Box (C6) - Shown when score > 60 */}
          {score > 60 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">সন্দেহজনক Order!</p>
                  <p className="text-xs text-red-600 mt-1">Risk Score: {score}/100</p>
                  <ul className="text-xs text-red-600 mt-1.5 space-y-1">
                    {reasons.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Info Alert Box - Shown when customer has success history */}
          {foundCustomer && foundCustomer.successOrders > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                ℹ️ এই customer আগে {foundCustomer.successOrders} টি সফল order করেছে।
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
