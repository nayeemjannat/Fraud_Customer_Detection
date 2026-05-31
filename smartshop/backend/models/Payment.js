const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  method:        { type: String, enum: ['COD', 'bKash', 'Nagad', 'Rocket'], required: true },
  status:        { type: String, enum: ['unpaid','partial','paid','refunded'], default: 'unpaid' },
  amount:        { type: Number, required: true },
  paidAmount:    { type: Number, default: 0 },
  transactionId: String,   // bKash/Nagad transaction ID
  paidAt:        Date,
  notes:         String,
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
