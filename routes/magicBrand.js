const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // adjust path if needed

// GET /magic-brand
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("magic-brand", { products });
  } catch (err) {
    console.error("Error loading magic brand products:", err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
