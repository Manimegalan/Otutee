const { body, validationResult } = require("express-validator");

const create = (req, res, next) => {
  let array;
  if (req.user.EducationType === "School") {
    array = [
      body("EducationId").notEmpty(),
      body("ClassId").notEmpty(),
      body("SubjectId").notEmpty(),
      body("ChapterId").notEmpty(),
      body("Name").notEmpty(),
      body("type").notEmpty(),
      body("Content.*.Language").notEmpty(),
      body("Content.*.Data").notEmpty(),
    ];
  } else if (req.user.EducationType === "College") {
    array = [
      body("EducationId").notEmpty(),
      body("DepartmentId").notEmpty(),
      body("SemesterId").notEmpty(),
      body("SubjectId").notEmpty(),
      body("ChapterId").notEmpty(),
      body("Name").notEmpty(),
      body("type").notEmpty(),
      body("Content.*.Language").notEmpty(),
      body("Content.*.Data").notEmpty(),
    ];
  }
  array.forEach((rule) => rule(req));
  next();
};

const update = () => {
  return [
    body("PostId").notEmpty(),
    body("Name").notEmpty(),
    body("type").notEmpty(),
    body("Content.*.Language").notEmpty(),
    body("Content.*.Data").notEmpty(),
  ];
};

const deletePost = () => {
  return [body("PostId").notEmpty()];
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
  update,
  deletePost,
  validate,
};
