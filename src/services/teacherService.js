const mongoose = require("mongoose");
const Teacher = require("../models/teacherSchema");

exports.findOne = async (query) => {
  return await Teacher.findOne(query);
};

exports.create = async (query) => {
  return await Teacher.create(query);
};

exports.updateOne = async (query, data) => {
  return await Teacher.updateOne(query, data);
};
