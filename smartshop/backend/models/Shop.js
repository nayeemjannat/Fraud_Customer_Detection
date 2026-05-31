const mongoose = require('mongoose')

const shopSchema = new mongoose.Schema({
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  shopName:     { type: String, default: 'My Shop' },
  logo:         String,   // image URL
  primaryColor: { type: String, default: '#1A56DB' },
  phone:        String,
  address:      String,
  plan:         { type: String, enum: ['basic','standard','premium'], default: 'basic' },
}, { timestamps: true })

module.exports = mongoose.model('Shop', shopSchema)
