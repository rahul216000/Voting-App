require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    const conn = await mongoose.connect(dbURI); // No need for useNewUrlParser or useUnifiedTopology
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB()

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));


// Routes
app.use("/admin", require("./routes/admin"));
app.use("/", require("./routes/user"));

app.use("/admin-voting", require("./routes/voting-admin"));
app.use("/voting", require("./routes/voting-user"));

app.use('/admin-magic-brand', require('./routes/adminMagicBrand'));
app.use('/magic-brand', require('./routes/magicBrand'));


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
