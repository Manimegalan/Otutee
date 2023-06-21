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

exports.findOne = async (query) => {
  return await Education.schoolModel.findOne(query);
};

exports.schoolUpdateOne = async (query, data, filters) => {
  return await Education.schoolModel.updateOne(query, data, filters)
}

exports.collegeUpdateOne = async(query, data, filters)=>{
  return await Education.collegeModel.updateOne(query, data, filters)
}