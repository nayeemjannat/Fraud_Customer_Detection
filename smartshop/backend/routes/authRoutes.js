const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const User     = require('../models/User')
const Shop     = require('../models/Shop')

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'অনুগ্রহ করে সব তথ্য দিন' })
    }

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে' })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({ name, email, password: hashed })

    // Create default shop for new user
    const shop = await Shop.create({
      owner: user._id,
      shopName: `${name}'s Shop`,
      primaryColor: '#1A56DB'
    })

    // Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopId: shop._id
      }
    })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ message: 'অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড দিন' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'ভুল ইমেইল অথবা পাসওয়ার্ড' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'ভুল ইমেইল অথবা পাসওয়ার্ড' })
    }

    // Find associated shop
    let shop = await Shop.findOne({ owner: user._id })
    if (!shop) {
      shop = await Shop.create({
        owner: user._id,
        shopName: `${user.name}'s Shop`,
        primaryColor: '#1A56DB'
      })
    }

    // Sign JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopId: shop._id
      }
    })
  } catch (err) { next(err) }
})

module.exports = router
