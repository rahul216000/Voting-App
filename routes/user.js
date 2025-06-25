const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/", async (req, res) => {
  const latest = await Question.findOne().sort({ createdAt: -1 }).lean();
  res.render("user", { latest });
});

router.get("/wallet", async (req, res) => {
  res.render("wallet");
});

module.exports = router;
