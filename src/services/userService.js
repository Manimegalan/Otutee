const mongoose = require("mongoose");
const User = require("../models/userSchema");

exports.findOne = async (query) => {
  return await User.findOne(query);
};

exports.create = async (query) => {
  return await User.create(query);
};

exports.updateOne = async (query, data) => {
  return await User.updateOne(query, data);
};
