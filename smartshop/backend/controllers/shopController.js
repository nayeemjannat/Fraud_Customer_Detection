const Shop = require('../models/Shop')

// GET /api/shop
exports.getShop = async (req, res, next) => {
  try {
    let shop = await Shop.findOne({ owner: req.user._id })
    if (!shop) {
      shop = await Shop.create({
        owner: req.user._id,
        shopName: `${req.user.name}'s Shop`,
        primaryColor: '#1A56DB'
      })
    }
    res.json(shop)
  } catch (err) { next(err) }
}

// PUT /api/shop
exports.updateShop = async (req, res, next) => {
  try {
    const { shopName, primaryColor, logo, phone, address } = req.body
    const shop = await Shop.findOneAndUpdate(
      { owner: req.user._id },
      { shopName, primaryColor, logo, phone, address },
      { new: true, upsert: true }
    )
    res.json(shop)
  } catch (err) { next(err) }
}
