const express = require("express");
const studentController = express.Router();

const { upload } = require("../middleware/common");
const studentValidator = require("../middleware/validators/student");
const studentService = require("../services/studentService");

studentController.post(
  "/register",
  upload("student").any("files"),
  studentValidator.register(),
  studentValidator.validate,
  async (req, res) => {
    res.send({ body: req.body, files: req.files });
  }
);

module.exports = studentController;
