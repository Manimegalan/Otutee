const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  Name: {
    type: String,
  },
  Author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  type: {
    type: String,
  },
  Content: [
    {
      Language: {
        type: String,
      },
      Type: {
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
