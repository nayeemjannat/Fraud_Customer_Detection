const mongoose = require('mongoose')

const sharedSchema = new mongoose.Schema({
  phone:   { type: String, required: true, unique: true },
  reason:  String,
  addedBy: String,  // কোন seller যোগ করেছে
}, { timestamps: true })

module.exports = mongoose.model('SharedBlacklist', sharedSchema)
