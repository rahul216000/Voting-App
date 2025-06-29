const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");

// Show latest voting question
router.get("/", async (req, res) => {
  const latest = await Vote.findOne().sort({ createdAt: -1 }).lean();
  res.render("voting-user", { latest });
});

module.exports = router;
