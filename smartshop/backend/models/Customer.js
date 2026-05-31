const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  phone:          { type: String, required: true, unique: true },
  address:        String,
  totalOrders:    { type: Number, default: 0 },
  successOrders:  { type: Number, default: 0 },
  returnCount:    { type: Number, default: 0 },
  blacklisted:    { type: Boolean, default: false },
  blacklistReason: String,
  // reliabilityScore = (successOrders / totalOrders) * 100
}, { timestamps: true })

// Virtual: Reliability Score
customerSchema.virtual('reliabilityScore').get(function () {
  if (this.totalOrders === 0) return 0
  return Math.round((this.successOrders / this.totalOrders) * 100)
})

module.exports = mongoose.model('Customer', customerSchema)
