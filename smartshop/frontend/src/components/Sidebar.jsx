import { NavLink } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/',           label: 'Dashboard',    icon: '📊' },
  { path: '/orders',     label: 'Orders',       icon: '📦' },
  { path: '/customers',  label: 'Customers',    icon: '👤' },
  { path: '/blacklist',  label: 'Blacklist',    icon: '🚫' },
  { path: '/payments',   label: 'Payments',     icon: '💰' },
  { path: '/analytics',  label: 'Analytics',    icon: '📈' },
  { path: '/settings',   label: 'Settings',     icon: '⚙️' },
]

// Helper: generate a very light tint from any hex color for the active bg
function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return { r, g, b }
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const { shop } = useShop()
  const { logout } = useAuth()
  const primaryColor = shop?.primaryColor || '#1A56DB'

  const { r, g, b } = hexToRgb(primaryColor)
  // Active nav item: light tinted background + primary text color
  const activeStyle = {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.10)`,
    color: primaryColor,
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col no-print shadow-sm transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      {/* Logo / Brand Area */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Dynamic logo or emoji icon */}
          {shop?.logo ? (
            <img
              src={shop.logo}
              alt="logo"
              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white shrink-0 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              🛒
            </span>
          )}
          <span className="font-bold text-base text-gray-800 tracking-tight font-sans truncate">
            {shop?.shopName || 'SmartShop'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 font-medium ${
                isActive ? 'font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            style={({ isActive }) => isActive ? activeStyle : {}}
          >
            <span className="w-5 h-5 flex items-center justify-center text-base shrink-0">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Logout Button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 font-medium"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Developer Credit */}
      <div className="px-4 pb-4 w-full">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          {/* Animated Shine Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-shimmer pointer-events-none"></div>
          
          <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase mb-0.5">
            Crafted by Nayeem
          </span>
          <span className="text-[9px] font-medium text-slate-500 italic flex items-center gap-1">
            From concept to code
            <span className="animate-pulse text-indigo-400">✨</span>
          </span>
        </div>
      </div>
    </aside>
    </>
  )
}
