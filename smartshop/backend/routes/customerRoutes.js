const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getCustomers, getCustomer, toggleBlacklist } = require('../controllers/customerController')

router.get('/',                   protect, getCustomers)
router.get('/:id',                protect, getCustomer)
router.put('/:id/blacklist',      protect, toggleBlacklist)

module.exports = router
