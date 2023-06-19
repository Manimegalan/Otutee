const mongoose = require("mongoose");
const Post = require("../models/postSchema");

exports.create = async (query) => {
  return await Post.create(query);
};
