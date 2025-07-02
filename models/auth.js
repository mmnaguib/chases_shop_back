const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Auth", authSchema);
