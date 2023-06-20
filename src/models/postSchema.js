const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  Name: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Private", "Public"],
  },
  Author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  Content: [
    {
      Language: {
        type: String,
      },
      Data: {
        type: String,
      },
    },
  ],
  Likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  Comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
});

module.exports = mongoose.model("Posts", postSchema);
