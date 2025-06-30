const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  link: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
