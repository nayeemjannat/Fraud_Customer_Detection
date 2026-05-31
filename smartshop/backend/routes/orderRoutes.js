const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getOrders, getOrder, createOrder, updateStatus } = require('../controllers/orderController')

router.get('/',           protect, getOrders)
router.get('/:id',        protect, getOrder)
router.post('/',          protect, createOrder)
router.put('/:id/status', protect, updateStatus)

module.exports = router
