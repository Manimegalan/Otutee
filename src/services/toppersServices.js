const mongoose = require("mongoose");
const Toppers = require("../models/toppersSchema");

exports.create = async (data) => {
  return await Toppers.create(data);
};

exports.find = async (query) => {
  return await Toppers.find(query);
};

exports.updateOne = async (query, data) => {
  return await Toppers.updateOne(query, data);
};

exports.deleteOne = async (query) => {
  return await Toppers.deleteOne(query);
};
