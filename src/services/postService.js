const mongoose = require("mongoose");
const Post = require("../models/postSchema");

exports.find = async (query) => {
  return await Post.find(query)
    .sort({ createdAt: -1 })
    .populate({ path: "Author", select: "_id Name" });
};

exports.create = async (query) => {
  return await Post.create(query);
};

exports.updateOne = async (query, data) => {
  return await Post.updateOne(query, data);
};

exports.deleteOne = async (query) => {
  return await Post.deleteOne(query);
};
