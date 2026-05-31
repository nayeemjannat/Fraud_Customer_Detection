const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res.status(401).json({ message: 'অথরাইজেশন ব্যর্থ, ইউজার পাওয়া যায়নি' })
      }
      next()
    } catch (error) {
      return res.status(401).json({ message: 'অথরাইজেশন ব্যর্থ, টোকেন সঠিক নয়' })
    }
  } else {
    return res.status(401).json({ message: 'অথরাইজেশন ব্যর্থ, কোনো টোকেন পাওয়া যায়নি' })
  }
}

module.exports = { protect }
