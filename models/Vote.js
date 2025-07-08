const mongoose = require("mongoose");

const voteOptionSchema = new mongoose.Schema({
  text: String,
  image: String,
});

const voteSchema = new mongoose.Schema({
  question: String,
  questionImage: String,
  questionImageLink: String,
  logo: String,
  mode: String,
  token: String, // ✅ Add this line
  options: [voteOptionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
