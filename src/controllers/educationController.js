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
        Classes: [],
      };
      const schoolCreated = await educationService.schoolCreate(data);
      sendResponse(res, 200, "Success", {
        message: "School added successfully!",
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
  "/school/addClass",
  educationValidator.addClass(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, ClassName } = req.body;
      const query = { _id: EducationId };
      const data = {
        $push: { Classes: { Name: ClassName, Subjects: [] } },
      };
      const response = await educationService.schoolUpdateOne(query, data);
      sendResponse(res, 200, "Success", {
        message: "Class added successfully!",
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

educationController.post(
  "/school/addSubject",
  educationValidator.addSubject(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, ClassId, SubjectName } = req.body;
      const query = { _id: EducationId, "Classes._id": ClassId };
      const data = {
        $push: { "Classes.$.Subjects": { Name: SubjectName, Chapters: [] } },
      };
      const response = await educationService.schoolUpdateOne(query, data);
      sendResponse(res, 200, "Success", {
        message: "Subject added successfully!",
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

educationController.post(
  "/school/addChapter",
  educationValidator.addChapter(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, ClassId, SubjectId, ChapterName } = req.body;
      const query = {
        _id: EducationId,
        "Classes._id": ClassId,
        "Classes.Subjects._id": SubjectId,
      };
      const data = {
        $push: {
          "Classes.$.Subjects.$[subject].Chapters": {
            Name: ChapterName,
            Posts: [],
          },
        },
      };
      const filters = {
        arrayFilters: [
          {
            "subject._id": SubjectId,
          },
        ],
      };
      const response = await educationService.schoolUpdateOne(
        query,
        data,
        filters
      );
      sendResponse(res, 200, "Success", {
        message: "Chapter added successfully!",
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

educationController.post(
  "/addCollege",
  educationValidator.addCollege(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Name: req.body.EducationName,
        Departments: [],
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

educationController.post(
  "/college/addDepartment",
  educationValidator.addDepartment(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, DepartmentName } = req.body;
      const query = { _id: EducationId };
      const data = {
        $push: {
          Departments: { Name: DepartmentName, Semesters: [] },
        },
      };
      const response = await educationService.collegeUpdateOne(query, data);
      sendResponse(res, 200, "Success", {
        message: "Department added successfully!",
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

educationController.post(
  "/college/addSemester",
  educationValidator.addSemester(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, DepartmentId, SemesterName } = req.body;
      const query = { _id: EducationId, "Departments._id": DepartmentId };
      const data = {
        $push: {
          "Departments.$.Semesters": { Name: SemesterName, Subjects: [] },
        },
      };
      const response = await educationService.collegeUpdateOne(query, data);
      sendResponse(res, 200, "Success", {
        message: "Semester added successfully!",
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

educationController.post(
  "/college/addSubject",
  educationValidator.addCollegeSubject(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, DepartmentId, SemesterId, SubjectName } = req.body;
      const query = {
        _id: EducationId,
        "Departments._id": DepartmentId,
        "Departments.Semesters._id": SemesterId,
      };
      const data = {
        $push: {
          "Departments.$.Semesters.$[semester].Subjects": {
            Name: SubjectName,
            Chapters: [],
          },
        },
      };
      const filters = {
        arrayFilters: [
          {
            "semester._id": SemesterId,
          },
        ],
      };
      const response = await educationService.collegeUpdateOne(
        query,
        data,
        filters
      );
      sendResponse(res, 200, "Success", {
        message: "Subject added successfully!",
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

educationController.post(
  "/college/addChapter",
  educationValidator.addCollegeChapter(),
  educationValidator.validate,
  async (req, res) => {
    try {
      const { EducationId, DepartmentId, SemesterId, SubjectId, ChapterName } =
        req.body;
      const query = {
        _id: EducationId,
        "Departments._id": DepartmentId,
        "Departments.Semesters._id": SemesterId,
        "Departments.Semesters.Subjects._id": SubjectId,
      };
      const data = {
        $push: {
          "Departments.$.Semesters.$[semester].Subjects.$[subject].Chapters": {
            Name: ChapterName,
            Posts: [],
          },
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
        ],
      };
      const response = await educationService.collegeUpdateOne(
        query,
        data,
        filters
      );
      sendResponse(res, 200, "Success", {
        message: "Chapter added successfully!",
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

educationController.get("/list", async (req, res) => {
  try {
    const data = await educationService.educationList();
    sendResponse(res, 200, "Success", {
      message: "Educations retrieved successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = educationController;
