const mongoose = require("mongoose");
const DashboardPost = require("../models/dashboardPost");

exports.create = async (query) => {
  return await DashboardPost.create(query);
};

exports.find = async () => {
  return await DashboardPost.find()
    .sort({ updatedAt: -1 })
    .populate({ path: "Author", select: "_id Name" });
};

exports.updateOne = async (query, data) => {
  return await DashboardPost.updateOne(query, data);
};

exports.deleteOne = async (query) => {
  return await DashboardPost.deleteOne(query);
};
