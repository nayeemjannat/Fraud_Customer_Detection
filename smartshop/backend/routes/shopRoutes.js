const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect } = require('../middleware/authMiddleware')
const { getShop, updateShop } = require('../controllers/shopController')

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

router.get('/',      protect, getShop)
router.put('/',      protect, updateShop)
router.post('/logo', protect, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'অনুগ্রহ করে লোগো ফাইলটি সিলেক্ট করুন' })
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ url: fileUrl })
})

module.exports = router
