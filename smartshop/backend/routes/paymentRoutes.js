const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getPayments, getUnpaidAlerts, updatePayment } = require('../controllers/paymentController')

router.get('/',                protect, getPayments)
router.get('/unpaid-alerts',   protect, getUnpaidAlerts)
router.put('/:id',             protect, updatePayment)

module.exports = router

