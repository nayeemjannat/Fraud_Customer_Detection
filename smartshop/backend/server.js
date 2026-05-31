const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/orders',    require('./routes/orderRoutes'))
app.use('/api/customers', require('./routes/customerRoutes'))
app.use('/api/payments',  require('./routes/paymentRoutes'))
app.use('/api/analytics', require('./routes/analyticsRoutes'))
app.use('/api/shop',      require('./routes/shopRoutes'))

// Health check
app.get('/', (req, res) => res.json({ message: 'SmartShop API running!' }))

// Error handler
app.use(require('./middleware/errorHandler'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('Server running on port ' + PORT))
