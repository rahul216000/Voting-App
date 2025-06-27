const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: String,
  questionImage: String,
  questionImageLink: String, // ✅ NEW FIELD
  options: [
    {
      text: String,
      image: String
    }
  ],
  correctAnswer: String, // "A", "B", "C", "D"
  token: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", QuestionSchema);
