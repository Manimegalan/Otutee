const { body, oneOf, validationResult } = require("express-validator");

const addSchool = () => {
  return [
    body("EducationName").not().isEmpty(),
    body("ClassName").not().isEmpty(),
  ];
};

const addCollege = () => {
  return [
    body("EducationName").not().isEmpty(),
    body("DepartmentName").not().isEmpty(),
  ];
};

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
  addCollege,
  validate,
};
