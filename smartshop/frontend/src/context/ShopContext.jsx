import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosInstance'
import { registerShopRefresh } from './AuthContext'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [shop, setShop] = useState({
    shopName: 'SmartShop',
    primaryColor: '#1A56DB',
    logo: null,
  })

  async function refreshShop() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await api.get('/shop')
      setShop(data)
    } catch (e) {}
  }

  // Register refreshShop so AuthContext can call it after login
  useEffect(() => {
    registerShopRefresh(refreshShop)
    // Initial fetch on app load if already logged in
    refreshShop()
  }, [])

  // Settings page থেকে shop update করবে
  async function updateShop(formData) {
    const { data } = await api.put('/shop', formData)
    setShop(data)
    return data
  }

  return (
    <ShopContext.Provider value={{ shop, updateShop, refreshShop }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  return useContext(ShopContext)
}
