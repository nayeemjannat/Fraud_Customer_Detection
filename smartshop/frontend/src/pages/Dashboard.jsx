import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import StatsCard from '../components/StatsCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/orders')
      ])
      setSummary(summaryRes.data)
      setRecentOrders(ordersRes.data)
    } catch (err) {
      console.error(err)
      setError('ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium text-sm">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <p className="text-red-500 text-lg font-bold">❌ {error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  const { todayOrders, totalOrders, totalReturns, highRiskOrders, totalRevenue, savings } = summary

  // Slices for recent lists
  const lastOrders = recentOrders.slice(0, 5)
  const suspiciousOrders = recentOrders.filter(o => o.riskLevel === 'high' || o.riskLevel === 'blocked').slice(0, 5)

  // Status style configuration
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    returned: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড সামারি</h1>
        <p className="text-sm text-gray-500 mt-0.5">আপনার ব্যবসার দৈনিক কেনাবেচা ও ঝুঁকির রিয়েল-টাইম ওভারভিউ নিচে দেওয়া হল।</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="আজকের অর্ডার"
          value={`${todayOrders} টি`}
          subtitle="আজকে আসা নতুন অর্ডারের সংখ্যা"
          color="blue"
        />
        <StatsCard
          title="সর্বমোট বিক্রয়মূল্য"
          value={`৳${totalRevenue?.toLocaleString('en-IN')}`}
          subtitle="সফল অর্ডারের মোট আর্থিক মূল্য"
          color="green"
        />
        <StatsCard
          title="মোট রিটার্ন অর্ডার"
          value={`${totalReturns} টি`}
          subtitle="ডেলিভারি ব্যর্থ হওয়া পার্সেল সংখ্যা"
          color="red"
        />
        <StatsCard
          title="উচ্চ ঝুঁকিপূর্ণ অর্ডার"
          value={`${highRiskOrders} টি`}
          subtitle="ঝুঁকিপূর্ণ ও ব্লকড অর্ডারের সংখ্যা"
          color="yellow"
        />
      </div>

      {/* Premium Fraud Savings Alert Banner (Savings Counter) */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="z-10 space-y-1 text-center md:text-left">
          <h2 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
            <span>🛡️</span> ফ্রড প্রোটেকশন সেভিংস কাউন্টার
          </h2>
          <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
            স্মার্টশপের রুল-ভিত্তিক ফ্রড ইঞ্জিন অটোমেটিকভাবে সন্দেহজনক ফেক অর্ডার সনাক্ত ও ব্লক করেছে। ফলস্বরূপ আপনি বড় অংকের লোকসান থেকে রক্ষা পেয়েছেন।
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl text-center border border-white/20 min-w-56 shrink-0">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">মোট লোকসান থেকে বাঁচানো অর্থ</p>
          <p className="text-3xl font-extrabold text-white mt-1">৳{savings?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Orders (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-800">সর্বশেষ অর্ডারসমূহ</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              সব অর্ডার দেখুন →
            </button>
          </div>

          {lastOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">কোনো অর্ডার পাওয়া যায়নি।</p>
          ) : (
            <div className="divide-y divide-gray-50 text-xs">
              {lastOrders.map(o => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer rounded-lg px-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{o.customerName}</span>
                      <span className="font-mono text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                        #{o._id.substring(o._id.length - 6)}
                      </span>
                    </div>
                    <p className="text-gray-500 font-mono text-[10px]">{o.phone}</p>
                  </div>
                  
                  <div className="text-center">
                    <span className="font-semibold text-gray-800 block">{o.product}</span>
                    <span className="text-[10px] text-gray-400">Qty: {o.quantity}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-extrabold text-gray-900 block">৳{o.totalAmount?.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase">{o.paymentMethod}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Real-time Risks & Alerts (col-span-1) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              <span className="animate-pulse w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              <span>রিস্ক মনিটর</span>
            </h2>
            <button
              onClick={() => navigate('/blacklist')}
              className="text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              ব্ল্যাকলিস্ট →
            </button>
          </div>

          {suspiciousOrders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <span className="text-2xl">🛡️</span>
              <p className="text-sm text-green-600 font-semibold">কোনো ঝুঁকিপূর্ণ অর্ডার সনাক্ত করা হয়নি</p>
              <p className="text-xs text-gray-400">সব লেনদেন ও কার্যক্রম নিরাপদ রয়েছে।</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {suspiciousOrders.map(o => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="border border-red-100 bg-red-50/50 rounded-xl p-3.5 space-y-2.5 hover:bg-red-50 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{o.customerName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{o.phone}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      o.riskLevel === 'blocked' ? 'bg-gray-900 text-white' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {o.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-gray-700 bg-white/75 p-2 rounded border border-red-50">
                    <p className="font-semibold">ঝুঁকির কারণসমূহ:</p>
                    <ul className="list-disc pl-3 mt-0.5 space-y-0.5 text-red-600 text-[10px]">
                      {o.riskReasons?.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
                    <span>ক্ষতির পরিমাণ: <strong className="text-gray-800">৳{o.totalAmount}</strong></span>
                    <span>{new Date(o.createdAt).toLocaleDateString('bn-BD', { dateStyle: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
