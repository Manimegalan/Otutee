const express = require("express");
const postController = express.Router();

const postValidator = require("../middleware/validators/post");
const postService = require("../services/postService");
const educationService = require("../services/educationService");
const { sendResponse } = require("../utils/common");

postController.get("/", async (req, res) => {
  try {
    const data = await postService.find({
      $and: [{ type: "Public" }, { Author: req.user._id }],
    });
    sendResponse(res, 200, "Success", {
      message: "Post retrieved successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

postController.post("/create", async (req, res) => {
  try {
    req.body.Author = req.user._id;
    const postRespose = await postService.create(req.body);
    let response;
    if (req.user.EducationType === "School") {
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
    } else if (req.user.EducationType === "College") {
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
      response = await educationService.collegeUpdateOne(query, data, filters);
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
});

postController.post(
  "/update",
  postValidator.update(),
  postValidator.validate,
  async (req, res) => {
    try {
      const data = await postService.updateOne(
        { _id: req.body.PostId },
        { $set: req.body }
      );
      sendResponse(res, 200, "Success", {
        message: "Post updated successfully!",
        data,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

postController.delete(
  "/delete",
  postValidator.deletePost(),
  postValidator.validate,
  async (req, res) => {
    try {
      const data = await postService.deleteOne({ _id: req.body.PostId });
      sendResponse(res, 200, "Success", {
        message: "Post deleted successfully!",
        data,
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
