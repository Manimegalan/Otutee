const mongoose = require("mongoose");
const Student = require("../models/studentSchema");

exports.findOne = async (query) => {
  return await Student.findOne(query);
};

exports.create = async (query) => {
  return await Student.create(query);
};

exports.updateOne = async (query, data) => {
  return await Student.updateOne(query, data);
};
