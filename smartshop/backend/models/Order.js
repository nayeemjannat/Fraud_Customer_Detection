const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customerName:  { type: String, required: true },
  phone:         { type: String, required: true },
  address:       { type: String, required: true },
  product:       { type: String, required: true },
  quantity:      { type: Number, required: true, default: 1 },
  totalAmount:   { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad', 'Rocket', 'Partial'], default: 'COD' },
  status:        { type: String, enum: ['pending','confirmed','shipped','delivered','returned','cancelled'], default: 'pending' },
  riskScore:     { type: Number, default: 0 },
  riskLevel:     { type: String, enum: ['low','medium','high','blocked'], default: 'low' },
  riskReasons:   [String],
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  deviceId:      String,
  notes:         String,
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
