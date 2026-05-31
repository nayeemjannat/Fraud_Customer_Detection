import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { shop } = useShop()
  const primaryColor = shop?.primaryColor || '#1A56DB'

  return (
    <header className="h-16 bg-white border-b border-gray-100 shadow-sm px-6 flex justify-between items-center no-print">
      {/* Left side: Welcome message */}
      <div>
        <h1 className="text-base font-bold text-gray-800 leading-tight">
          {shop?.shopName || 'SmartShop'}
        </h1>
        {user?.name && (
          <p className="text-xs text-gray-400 font-medium">স্বাগতম, {user.name}</p>
        )}
      </div>

      {/* Right side: Status + Logout */}
      <div className="flex items-center gap-3">
        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium border border-green-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>Online</span>
        </div>

        {/* User badge */}
        {user?.name && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-sm"
            style={{ backgroundColor: primaryColor }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={logout}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
