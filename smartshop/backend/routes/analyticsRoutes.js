const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getSummary, getWeekly, getMonthlySummary } = require('../controllers/analyticsController')

router.get('/summary',         protect, getSummary)
router.get('/weekly',          protect, getWeekly)
router.get('/monthly-summary', protect, getMonthlySummary)

module.exports = router

