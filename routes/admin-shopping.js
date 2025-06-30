const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const ShoppingItem = require("../models/ShoppingItem");

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
  const items = await ShoppingItem.find().lean();
  res.render("admin-shopping", { items });
});

// Save new or update existing
router.post("/save", upload.single("image"), async (req, res) => {
  const { id, title, description, link, existingImage } = req.body;
  let image = req.file ? `/uploads/${req.file.filename}` : existingImage;

  if (req.body.removeImage === "true") image = "";

  if (id) {
    await ShoppingItem.findByIdAndUpdate(id, { title, description, link, image });
  } else {
    await ShoppingItem.create({ title, description, link, image });
  }
  res.redirect("/admin-shopping");
});

// Delete image only
router.post("/delete-image", async (req, res) => {
  const { id } = req.body;
  const item = await ShoppingItem.findById(id);
  if (item && item.image) {
    const imagePath = path.join(__dirname, "..", "public", item.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    item.image = "";
    await item.save();
  }
  res.sendStatus(200);
});

// Delete item
router.post("/delete", async (req, res) => {
  const { id } = req.body;
  const item = await ShoppingItem.findById(id);
  if (item?.image) {
    const imgPath = path.join(__dirname, "..", "public", item.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  await ShoppingItem.findByIdAndDelete(id);
  res.redirect("/admin-shopping");
});

module.exports = router;
