import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login')

  // Form inputs
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Basic Validation
    if (!email || !password || (activeTab === 'register' && !name)) {
      setError('অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।')
      setLoading(false)
      return
    }

    try {
      if (activeTab === 'login') {
        // Authenticate
        await login(email, password)
        setSuccess('লগইন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...')
        setTimeout(() => {
          navigate('/')
        }, 1200)
      } else {
        // Register account
        const response = await api.post('/auth/register', { name, email, password })
        setSuccess('নিবন্ধন সফল হয়েছে! অনুগ্রহ করে লগইন করুন।')
        setActiveTab('login')
        setName('')
        setPassword('')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Top welcome brand area */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>
          <span className="text-4xl block z-10">🛒</span>
          <h2 className="text-xl font-black mt-2 tracking-tight z-10">SmartShop</h2>
          <p className="text-xs text-blue-100 mt-1 z-10">অর্ডার ম্যানেজমেন্ট ও ফ্রড ডিটেকশন সিস্টেম</p>
        </div>

        {/* Form area */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Tab Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all duration-150 ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all duration-150 ${
                activeTab === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              নিবন্ধন (Register)
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-medium">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-medium">
              ✨ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {/* Name - Register only */}
            {activeTab === 'register' && (
              <div className="space-y-1">
                <label className="block text-gray-700">নাম (Name):</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার সম্পূর্ণ নাম দিন"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-gray-700">ইমেইল ঠিকানা (Email):</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="যেমন: name@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-gray-700">পাসওয়ার্ড (Password):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>অনুরোধ প্রসেস হচ্ছে...</span>
                </>
              ) : activeTab === 'login' ? (
                'লগইন করুন'
              ) : (
                'অ্যাকাউন্ট তৈরি করুন'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center text-[10px] text-gray-400">
          SmartShop Security Protected v1.0.0
        </div>

      </div>
    </div>
  )
}
