const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Question = require("../models/Question");

// Multer Storage config
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

// POST Update or Create
router.post("/update", upload.any(), async (req, res) => {
  try {
    const { id, question, token, correctAnswer, questionImageLink } = req.body;
    const files = req.files;

    // Parse dynamic options
    const options = [];
    let index = 0;

    while (req.body[`optionText${index}`] !== undefined) {
      const text = req.body[`optionText${index}`];
      const removeFlag = req.body[`removeOptionImage${index}`];
      const fileObj = files.find(f => f.fieldname === `optionImage${index}`);
      const image = fileObj ? fileObj.filename : null;

      options.push({
        index,
        text,
        image,
        removeFlag
      });

      index++;
    }

    const questionImageFile = files.find(f => f.fieldname === "questionImage");
    const newQuestionImage = questionImageFile ? questionImageFile.filename : null;

    if (id) {
      const existing = await Question.findById(id);
      if (!existing) return res.status(404).send("Question not found");

      existing.question = question;
      existing.token = token;
      existing.correctAnswer = correctAnswer;
      existing.questionImageLink = questionImageLink || "";

      // Handle question image
      if (req.body.removeQuestionImage === "true" && existing.questionImage) {
        const oldPath = path.join(__dirname, "..", "public", "uploads", existing.questionImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        existing.questionImage = null;
      } else if (newQuestionImage) {
        existing.questionImage = newQuestionImage;
      }

      // Handle options and images safely
      const updatedOptions = [];

      for (let opt of options) {
        let finalImage = null;
        const prevOpt = existing.options?.[opt.index];

        if (opt.removeFlag === "true") {
          // Remove old image
          if (prevOpt?.image) {
            const oldPath = path.join(__dirname, "..", "public", "uploads", prevOpt.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          finalImage = null;
        } else {
          finalImage = opt.image || (prevOpt?.image || null);
        }

        updatedOptions.push({
          text: opt.text,
          image: finalImage
        });
      }

      existing.options = updatedOptions;

      await existing.save();
    } else {
      // New question
      const finalOptions = options.map(opt => ({
        text: opt.text,
        image: opt.image || null
      }));

      await Question.create({
        question,
        token,
        correctAnswer,
        questionImage: newQuestionImage || null,
        questionImageLink: questionImageLink || "",
        options: finalOptions
      });
    }

    res.redirect("/admin");
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
