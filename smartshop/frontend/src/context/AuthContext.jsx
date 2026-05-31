import { createContext, useContext, useState } from 'react'
import api from '../api/axiosInstance'

const AuthContext = createContext(null)

// ShopContext refreshShop কে বাইরে থেকে call করার জন্য একটি ref রাখা হয়েছে
let _refreshShop = null
export function registerShopRefresh(fn) { _refreshShop = fn }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      const saved = localStorage.getItem('user')
      return token && saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Login — API call করে token save করে
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ token: data.token, ...data.user }))
    setUser({ token: data.token, ...data.user })
    // Login সফল হলে shop info refresh করো
    if (_refreshShop) _refreshShop()
    return data
  }

  // Logout
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext)
}
