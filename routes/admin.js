const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Question = require("../models/Question");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});

const upload = multer({ storage });

// GET Admin Panel
router.get("/", async (req, res) => {
  const latest = await Question.findOne().sort({ createdAt: -1 }).lean();
  res.render("admin", { latest });
});

// POST Create or Update Question
router.post(
  "/update",
  upload.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "optionImage0", maxCount: 1 },
    { name: "optionImage1", maxCount: 1 },
    { name: "optionImage2", maxCount: 1 },
    { name: "optionImage3", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id, question, token, correctAnswer } = req.body;
      const files = req.files;

      const options = [];
      for (let i = 0; i < 4; i++) {
        const text = req.body[`optionText${i}`];
        const newImage = files[`optionImage${i}`]?.[0]?.filename;
        options.push({ text, image: newImage || null });
      }

      const newQuestionImage = files["questionImage"]?.[0]?.filename;

      // UPDATE FLOW
      if (id) {
        const existing = await Question.findById(id);
        if (!existing) return res.status(404).send("Question not found");

        existing.question = question;
        existing.correctAnswer = correctAnswer;
        existing.token = token;

        // Handle question image removal or replacement
        if (req.body.removeQuestionImage === "true" && existing.questionImage) {
          const oldPath = path.join(__dirname, "..", "public", "uploads", existing.questionImage);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          existing.questionImage = null;
        } else if (newQuestionImage) {
          existing.questionImage = newQuestionImage;
        }

        // Handle option text, new image, or removal
        for (let i = 0; i < 4; i++) {
          const removeFlag = req.body[`removeOptionImage${i}`];
          existing.options[i].text = options[i].text;

          if (removeFlag === "true" && existing.options[i].image) {
            const oldPath = path.join(__dirname, "..", "public", "uploads", existing.options[i].image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            existing.options[i].image = null;
          } else if (options[i].image) {
            existing.options[i].image = options[i].image;
          }
        }

        await existing.save();
      }

      // CREATE FLOW
      else {
        const finalOptions = options.map(opt => ({
          text: opt.text,
          image: opt.image
        }));

        await Question.create({
          question,
          questionImage: newQuestionImage || null,
          options: finalOptions,
          correctAnswer,
          token
        });
      }

      res.redirect("/admin");
    } catch (err) {
      console.error("Error saving question:", err);
      res.status(500).send("Failed to save question.");
    }
  }
);

module.exports = router;
