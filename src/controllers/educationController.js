const express = require("express");
const educationController = express.Router();

const educationValidator = require("../middleware/validators/education");
const educationService = require("../services/educationService");
const { sendResponse } = require("../utils/common");

educationController.post(
  "/addSchool",
  educationValidator.addSchool(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Name: req.body.EducationName,
        Classes: [
          {
            Name: req.body.ClassName,
          },
        ],
      };
      const schoolCreated = await educationService.schoolCreate(data);
      sendResponse(res, 200, "Success", {
        message: "School created successfully!",
        data: schoolCreated,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

educationController.post(
  "/addCollege",
  educationValidator.addCollege(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Name: req.body.EducationName,
        Departments: [
          {
            Name: req.body.DepartmentName,
          },
        ],
      };
      const collegeCreated = await educationService.collegeCreate(data);
      sendResponse(res, 200, "Success", {
        message: "College created successfully!",
        data: collegeCreated,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

module.exports = educationController;
