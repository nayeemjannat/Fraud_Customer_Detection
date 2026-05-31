import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export default function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (err) {
      console.error(err)
      setError('গ্রাহক তালিকা লোড করতে সমস্যা হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  // Filter customers locally by name or phone
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.address && c.address.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">আপনার দোকানের সকল গ্রাহক ও তাদের অর্ডার রেকর্ড দেখুন।</p>
      </div>

      {/* Search Bar Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="relative">
          <input
            placeholder="Search by name, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
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
            <p className="text-slate-500 font-medium text-sm">গ্রাহক তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium text-sm">
            ❌ {error}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <span className="text-4xl">👥</span>
            <p className="text-gray-600 font-semibold text-base">কোনো গ্রাহক পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">গ্রাহক</th>
                  <th className="text-left px-5 py-3.5">ঠিকানা</th>
                  <th className="text-center px-5 py-3.5">Total Orders</th>
                  <th className="text-center px-5 py-3.5">Success / Return</th>
                  <th className="text-center px-5 py-3.5">Reliability</th>
                  <th className="text-center px-5 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((cust) => {
                  const firstLetter = cust.name.charAt(0).toUpperCase()
                  
                  // Calculate reliability rate
                  const reliability = cust.totalOrders > 0
                    ? Math.round((cust.successOrders / cust.totalOrders) * 100)
                    : 0
                  
                  // Reliability badge styling
                  let reliabilityBadge = 'bg-gray-100 text-gray-600'
                  if (cust.totalOrders > 0) {
                    if (reliability >= 80) reliabilityBadge = 'bg-green-100 text-green-800'
                    else if (reliability >= 50) reliabilityBadge = 'bg-yellow-100 text-yellow-800'
                    else reliabilityBadge = 'bg-red-100 text-red-800'
                  }

                  return (
                    <tr
                      key={cust._id}
                      onClick={() => navigate(`/customers/${cust._id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Avatar + Customer details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600">
                            {firstLetter}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{cust.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{cust.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                        {cust.address || '—'}
                      </td>

                      {/* Total Orders */}
                      <td className="px-5 py-3.5 text-center font-semibold text-gray-800">
                        {cust.totalOrders}
                      </td>

                      {/* Success / Return breakdown */}
                      <td className="px-5 py-3.5 text-center text-xs">
                        <span className="text-green-600 font-bold">{cust.successOrders} সফল</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="text-red-500 font-bold">{cust.returnCount} রিটার্ন</span>
                      </td>

                      {/* Reliability Score */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${reliabilityBadge}`}>
                          {cust.totalOrders > 0 ? `${reliability}%` : 'কোনো তথ্য নেই'}
                        </span>
                      </td>

                      {/* Blacklisted Status */}
                      <td className="px-5 py-3.5 text-center">
                        {cust.blacklisted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                            🚫 Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/customers/${cust._id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          প্রোফাইল →
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
