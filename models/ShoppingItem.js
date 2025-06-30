const mongoose = require("mongoose");

const shoppingItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
});

module.exports = mongoose.model("ShoppingItem", shoppingItemSchema);
