const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Product = require("../models/Product");

// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Admin panel list
router.get("/", async (req, res) => {
  const products = await Product.find().lean();
  res.render("admin-magic-brand", { products });
});

// Save new or update existing
router.post("/save", upload.single("image"), async (req, res) => {
  const { id, title, description, link, existingImage } = req.body;
  let image = req.file ? `/uploads/${req.file.filename}` : existingImage;

  if (req.body.removeImage === "true") image = "";

  if (id) {
    await Product.findByIdAndUpdate(id, { title, description, link, image });
  } else {
    await Product.create({ title, description, link, image });
  }
  res.redirect("/admin-magic-brand");
});

// Delete image only
router.post("/delete-image", async (req, res) => {
  const { id } = req.body;
  const product = await Product.findById(id);
  if (product && product.image) {
    const imagePath = path.join(__dirname, "..", "public", product.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    product.image = "";
    await product.save();
  }
  res.sendStatus(200);
});

router.post("/delete", async (req, res) => {
  const { id } = req.body;
  const product = await Product.findById(id);
  if (product?.image) {
    const imgPath = path.join(__dirname, "..", "public", product.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  await Product.findByIdAndDelete(id);
  res.redirect("/admin-magic-brand");
});


module.exports = router;
