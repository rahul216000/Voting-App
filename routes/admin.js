const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/", async (req, res) => {
  const latest = await Question.findOne().sort({ createdAt: -1 }).lean();
  res.render("admin", { latest });
});

router.post("/update", async (req, res) => {
  const { question, token, option1, option2, option3, option4 } = req.body;
  const options = [option1, option2, option3, option4].filter(Boolean);

  await Question.create({ question, options, token });
  res.redirect("/admin");
});

module.exports = router;
