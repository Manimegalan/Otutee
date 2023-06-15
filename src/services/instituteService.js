const mongoose = require("mongoose");
const Institute = require("../models/instituteSchema");

exports.findOne = async (query) => {
  return await Institute.findOne(query);
};

exports.create = async (query) => {
  return await Institute.create(query);
};

exports.updateOne = async (query, data) => {
  return await Institute.updateOne(query, data);
};
