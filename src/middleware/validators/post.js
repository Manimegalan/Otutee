const { body, validationResult } = require("express-validator");

const create = () => {
  return [
    body("EducationId").notEmpty(),
    body("ClassId").notEmpty(),
    body("SubjectId").notEmpty(),
    body("ChapterId").notEmpty(),
    body("Name").notEmpty(),
    body("type").notEmpty(),
    body("Content.*.Language").notEmpty(),
    body("Content.*.Data").notEmpty(),
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
  create,
  validate,
};
