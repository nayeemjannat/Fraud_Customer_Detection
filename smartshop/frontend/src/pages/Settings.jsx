import { useState, useEffect } from 'react'
import { useShop } from '../context/ShopContext'
import api from '../api/axiosInstance'

export default function Settings() {
  const { shop, updateShop } = useShop()

  // Form states
  const [shopName, setShopName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#1A56DB')
  const [logo, setLogo] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [plan, setPlan] = useState('basic')

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Sync state with Shop Context once loaded
  useEffect(() => {
    if (shop) {
      setShopName(shop.shopName || '')
      setPrimaryColor(shop.primaryColor || '#1A56DB')
      setLogo(shop.logo || '')
      setPhone(shop.phone || '')
      setAddress(shop.address || '')
      setPlan(shop.plan || 'basic')
    }
  }, [shop])

  // Handle Logo file upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await api.post('/shop/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setLogo(response.data.url)
      setSuccess('লোগো ফাইলটি সফলভাবে আপলোড করা হয়েছে!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error(err)
      setError('লোগো আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setUploading(false)
    }
  }

  // Handle Form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!shopName) {
      setError('অনুগ্রহ করে শপের নাম দিন।')
      setLoading(false)
      return
    }

    try {
      await updateShop({
        shopName,
        primaryColor,
        logo,
        phone,
        address,
        plan
      })
      setSuccess('শপের ব্র্যান্ডিং সেটিংস সফলভাবে আপডেট করা হয়েছে!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setError('সেটিংস আপডেট সংরক্ষণ করতে সমস্যা হয়েছে।')
    } finally {
      setLoading(false)
    }
  }

  // Pre-configured harmonious color options
  const colorPresets = [
    { name: 'Classic Blue', hex: '#1A56DB' },
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Royal Purple', hex: '#7C3AED' },
    { name: 'Crimson Red', hex: '#E11D48' },
    { name: 'Dark Amber', hex: '#D97706' },
    { name: 'Teal Forest', hex: '#0D9488' }
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">White-label Branding Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">আপনার শপের নাম, লোগো এবং প্রাইমারি ব্র্যান্ডিং কালার পরিবর্তন করে সম্পূর্ণ কাস্টমাইজ করুন।</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium animate-pulse">
          ✨ {success}
        </div>
      )}

      {/* Grid structure: Left Form, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Branding Form (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800">ব্র্যান্ডিং কাস্টমাইজেশন</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
              
              {/* Shop Name */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-gray-700 font-bold">দোকান/শপের নাম (Shop Name) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="যেমন: SmartMart BD"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  required
                />
              </div>

              {/* Owner Phone */}
              <div className="space-y-1">
                <label className="block font-bold">যোগাযোগের মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01712345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                />
              </div>

              {/* Shop Plan */}
              <div className="space-y-1">
                <label className="block font-bold">সার্ভিস প্ল্যান (Service Plan):</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="basic">Basic (৳৫০০/মাস)</option>
                  <option value="standard">Standard (৳১০০০/মাস)</option>
                  <option value="premium">Premium (৳২০০০/মাস)</option>
                </select>
              </div>

              {/* Shop Address */}
              <div className="space-y-1 md:col-span-2">
                <label className="block font-bold">দোকান/শপের ঠিকানা (Address):</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="শপের সম্পূর্ণ ঠিকানা এখানে লিখুন..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-medium"
                ></textarea>
              </div>

              {/* Color Preset Selector */}
              <div className="space-y-2 md:col-span-2">
                <label className="block font-bold">প্রাইমারি ব্র্যান্ডিং কালার (Primary Brand Color):</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                        primaryColor === preset.hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {primaryColor === preset.hex && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                      )}
                    </button>
                  ))}
                  
                  {/* Custom color picker */}
                  <div className="flex items-center gap-1.5 ml-2 border border-gray-200 p-1.5 rounded-lg">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-6 h-6 border-0 p-0 cursor-pointer rounded bg-transparent"
                    />
                    <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">{primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Logo Upload Input */}
              <div className="space-y-2 md:col-span-2 pt-2">
                <label className="block font-bold">শপের লোগো আপলোড (Logo Upload):</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploading && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse shrink-0">আপলোড হচ্ছে...</span>
                  )}
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'পরিবর্তন সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করো'}
            </button>
          </form>
        </div>

        {/* Right: Live Preview Panel (col-span-1) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-6">
          <h2 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">লাইভ প্রিভিউ</h2>
          
          {/* Mockup Invoice showing dynamic settings */}
          <div className="border border-gray-200 rounded-xl overflow-hidden text-[10px] shadow-2xs">
            {/* Header branding */}
            <div
              className="p-3 text-white flex justify-between items-center transition-all duration-300"
              style={{ backgroundColor: primaryColor }}
            >
              <div>
                <p className="font-extrabold text-xs tracking-tight">{shopName || 'শপের নাম'}</p>
                <p className="text-[8px] text-white/75 font-mono">{phone || '01XXXXXXXXX'}</p>
              </div>
              
              {/* Dynamic Logo in preview */}
              {logo ? (
                <img src={logo} alt="Shop Logo" className="w-8 h-8 rounded-full border border-white/20 object-cover bg-white" />
              ) : (
                <span className="text-xl">🛒</span>
              )}
            </div>

            {/* Mock Billing Body */}
            <div className="p-3 space-y-2 text-gray-600 font-medium bg-slate-50/50">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="font-bold">আইটেম</span>
                <span className="font-bold">টোটাল</span>
              </div>
              <div className="flex justify-between text-gray-800">
                <span>Premium Wallet</span>
                <span>৳১,২০০</span>
              </div>
              <div className="flex justify-between text-gray-800 border-b border-gray-200 pb-1">
                <span>ডেলিভারি চার্জ</span>
                <span>৳৮০</span>
              </div>
              <div className="flex justify-between text-gray-900 font-extrabold text-xs">
                <span>মোট বিল</span>
                <span style={{ color: primaryColor }}>৳১,২৮০</span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-2 text-center text-[7px] text-gray-400">
              আমাদের পাশে থাকার জন্য ধন্যবাদ।
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-[11px] text-blue-700 leading-relaxed">
            💡 <strong>সাজেশন:</strong> যেকোনো কালার প্রিসেট সিলেক্ট করলে লাইভ প্রিভিউতে তার কালার থিম এবং সাইডবারের স্টাইল পরিবর্তন তাৎক্ষণিকভাবে লক্ষ্য করা যাবে।
          </div>
        </div>

      </div>
    </div>
  )
}
