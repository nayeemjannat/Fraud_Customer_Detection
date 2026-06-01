import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ShopProvider } from './context/ShopContext'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import OrderDetail from './pages/OrderDetail'
import Customers from './pages/Customers'
import CustomerProfile from './pages/CustomerProfile'
import Blacklist from './pages/Blacklist'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// Components
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

// ─── Protected Route wrapper ───────────────────────────────
function ProtectedLayout({ children }) {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  if (!user) {
    return <Navigate to="/login" />
  }
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
            <Route path="/orders/new" element={<ProtectedLayout><NewOrder /></ProtectedLayout>} />
            <Route path="/orders/:id" element={<ProtectedLayout><OrderDetail /></ProtectedLayout>} />
            <Route path="/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />
            <Route path="/customers/:id" element={<ProtectedLayout><CustomerProfile /></ProtectedLayout>} />
            <Route path="/blacklist" element={<ProtectedLayout><Blacklist /></ProtectedLayout>} />
            <Route path="/payments" element={<ProtectedLayout><Payments /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
