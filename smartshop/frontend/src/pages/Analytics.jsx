import { useState, useEffect } from 'react'
import api from '../api/axiosInstance'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, weeklyRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/weekly')
      ])
      setSummary(summaryRes.data)
      setWeeklyData(weeklyRes.data)
    } catch (err) {
      console.error(err)
      setError('অ্যানালিটিক্স ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
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
        <p className="text-slate-500 font-medium text-sm">অ্যানালিটিক্স লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <p className="text-red-500 text-lg font-bold">❌ {error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  const topProducts = summary?.topProducts || []

  // Formatting top products for BarChart
  const barChartData = topProducts.map(p => ({
    name: p._id || 'Unknown',
    quantity: p.count,
    amount: p.total
  }))

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">আপনার শপের সাপ্তাহিক বিক্রয় প্রবণতা এবং শীর্ষ পণ্যের বিবরণ চিত্রিত গ্রাফ নিচে উপস্থাপন করা হলো।</p>
      </div>

      {/* Grid Layout of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Trend Line Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">সাপ্তাহিক বিক্রয় প্রবণতা (Last 7 Days)</h2>
            <p className="text-xs text-gray-400 mt-0.5">গত ৭ দিনে সম্পন্ন হওয়া দৈনিক অর্ডার সংখ্যা পরিমাপ</p>
          </div>
          <div className="h-72 w-full text-xs font-semibold text-gray-500">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis allowDecimals={false} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Legend />
                <Line
                  name="অর্ডার সংখ্যা"
                  type="monotone"
                  dataKey="orders"
                  stroke="#1A56DB"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">শীর্ষ পণ্যের বিশ্লেষণ (Top 5 Products)</h2>
            <p className="text-xs text-gray-400 mt-0.5">মোট বিক্রিত পরিমাণ (Quantity) অনুযায়ী সর্বোচ্চ বিক্রয় হওয়া পণ্য</p>
          </div>
          {barChartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
              পর্যাপ্ত বিক্রয় তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="h-72 w-full text-xs font-semibold text-gray-500">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Legend />
                  <Bar
                    name="বিক্রিত পরিমাণ (Qty)"
                    dataKey="quantity"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Top Products Detailed Data List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">শীর্ষ বিক্রিত পণ্যের হিসাব তালিকা</h2>
          <p className="text-xs text-gray-400 mt-0.5">সবচেয়ে বেশি জনপ্রিয় ও রাজস্ব আয় করা পণ্যসমূহের বিস্তারিত পরিমাণ ও আর্থিক মূল্য</p>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">তালিকা দেওয়ার মতো পর্যাপ্ত তথ্য নেই।</p>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide text-left">
                  <th className="px-4 py-3">র‍্যাংক</th>
                  <th className="px-4 py-3">পণ্যের নাম</th>
                  <th className="px-4 py-3 text-center">বিক্রিত পরিমাণ (Quantity)</th>
                  <th className="px-4 py-3 text-right">সর্বমোট বিক্রয়মূল্য (Revenue)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                {topProducts.map((prod, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-400">
                      {index === 0 ? '🏆 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `${index + 1}`}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{prod._id || 'Unknown Product'}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-gray-800">{prod.count} টি</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-blue-600">৳{prod.total?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
