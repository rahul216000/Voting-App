const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Vote = require("../models/Vote");

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
  const latest = await Vote.findOne().sort({ createdAt: -1 }).lean();
  res.render("voting-admin", { latest });
});

// POST Create or Update Voting Question
router.post("/update", upload.any(), async (req, res) => {
  try {
    const { id, question, token, questionImageLink } = req.body;
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
      const existing = await Vote.findById(id);
      if (!existing) return res.status(404).send("Vote not found");

      existing.question = question;
      existing.token = token;
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
      // New voting question
      const finalOptions = options.map(opt => ({
        text: opt.text,
        image: opt.image || null
      }));

      await Vote.create({
        question,
        token,
        questionImage: newQuestionImage || null,
        questionImageLink: questionImageLink || "",
        options: finalOptions
      });
    }

    res.redirect("/admin-voting");
  } catch (err) {
    console.error("Error updating vote:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
