const Education = require("../models/educationSchema");

exports.schoolCreate = async (query) => {
  return await Education.schoolModel.create(query);
};

exports.collegeCreate = async (query) => {
  return await Education.collegeModel.create(query);
};

exports.educationList = async () => {
  return await Education.schoolModel.find();
};
