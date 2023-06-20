const express = require("express");
const postController = express.Router();

const postValidator = require("../middleware/validators/post");
const postService = require("../services/postService");
const educationService = require("../services/educationService");
const { sendResponse } = require("../utils/common");

postController.post(
  "/create",
  postValidator.create(),
  postValidator.validate,
  async (req, res) => {
    try {
      req.body.Author = req.user._id;
      const postRespose = await postService.create(req.body);
      let response;
      if (req.user.Role === "student") {
        const { EducationId, ClassId, SubjectId, ChapterId } = req.body;
        const query = {
          _id: EducationId,
          "Classes._id": ClassId,
          "Classes.Subjects._id": SubjectId,
          "Classes.Subjects.Chapters._id": ChapterId,
        };
        const data = {
          $push: {
            "Classes.$.Subjects.$[subject].Chapters.$[chapter].Posts":
              postRespose._id,
          },
        };
        const filters = {
          arrayFilters: [
            {
              "subject._id": SubjectId,
            },
            {
              "chapter._id": ChapterId,
            },
          ],
        };
        response = await educationService.schoolUpdateOne(query, data, filters);
      } else if (req.user.Role === "teacher") {
        const { EducationId, DepartmentId, SemesterId, SubjectId, ChapterId } =
          req.body;
        const query = {
          _id: EducationId,
          "Departments._id": DepartmentId,
          "Departments.Semesters._id": SemesterId,
          "Departments.Semesters.Subjects._id": SubjectId,
          "Departments.Semesters.Subjects.Chapters._id": ChapterId,
        };
        const data = {
          $push: {
            "Departments.$.Semesters.$[semester].Subjects.$[subject].Chapters.$[chapter].Posts":
              postRespose._id,
          },
        };
        const filters = {
          arrayFilters: [
            {
              "semester._id": SemesterId,
            },
            {
              "subject._id": SubjectId,
            },
            {
              "chapter._id": ChapterId,
            },
          ],
        };
        response = await educationService.collegeUpdateOne(
          query,
          data,
          filters
        );
      }
      sendResponse(res, 200, "Success", {
        message: "Post created successfully!",
        data: response,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

module.exports = postController;
