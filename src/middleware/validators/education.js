const { body, oneOf, validationResult } = require("express-validator");

const addSchool = () => {
  return [
    body("EducationName").not().isEmpty(),
  ];
};

const addClass = () => {
  return [
    body("EducationId").not().isEmpty(),
    body("ClassName").not().isEmpty(),
  ]
}

const addSubject = () => {
  return [
    body("EducationId").not().isEmpty(),
    body("ClassId").not().isEmpty(),
    body("SubjectName").not().isEmpty(),
  ]
}

const addChapter = () => {
  return [
    body("EducationId").not().isEmpty(),
    body("ClassId").not().isEmpty(),
    body("SubjectId").not().isEmpty(),
    body("ChapterName").not().isEmpty(),
  ]
}

const addCollege = () => {
  return [
    body("EducationName").not().isEmpty(),
  ];
};

const addDepartment = () => {
  return[
    body("EducationId").not().isEmpty(),
    body("DepartmentName").not().isEmpty(),
  ]
}

const addSemester = () => {
  return[
    body("EducationId").not().isEmpty(),
    body("DepartmentId").not().isEmpty(),
    body("SemesterName").not().isEmpty(),
  ]
}

const addCollegeSubject = () => {
  return [
    body("EducationId").not().isEmpty(),
    body("DepartmentId").not().isEmpty(),
    body("SemesterId").not().isEmpty(),
    body("SubjectName").not().isEmpty(),
  ]
}

const addCollegeChapter = () => {
  return [
    body("EducationId").not().isEmpty(),
    body("DepartmentId").not().isEmpty(),
    body("SemesterId").not().isEmpty(),
    body("SubjectId").not().isEmpty(),
    body("ChapterName").not().isEmpty(),
  ]
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) =>
    extractedErrors.push({
      [err.param]: err.msg,
    })
  );
  return res.status(400).json({ errors: errors.array() });
};

module.exports = {
  addSchool,
  addClass,
  addSubject,
  addChapter,
  addCollege,
  addDepartment,
  addSemester,
  addCollegeSubject,
  addCollegeChapter,
  validate,
};
