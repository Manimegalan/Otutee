const { body, check, validationResult } = require("express-validator");

const addTopper = (req, res, next) => {
  return [
    body("EducationType").not().isEmpty(),
    body("Name").not().isEmpty(),
    body("SchoolOrInstituteName").not().isEmpty(),
    check("ClassOrCourse").isArray().not().isEmpty(),
    body("YearOfPassing").not().isEmpty(),
    body("PercentageOrCGPA").not().isEmpty(),
    body("Description").not().isEmpty(),
  ];
};

const addJobVacancy = (req, res, next) => {
  return [];
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
  addTopper,
  addJobVacancy,
  validate,
};
