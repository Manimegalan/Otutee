const { body, validationResult } = require("express-validator");

const register = () => {
  return [
    // body("ProfileImage").not().isEmpty(),
    // body("IDProof").not().isEmpty(),
    body("Name").not().isEmpty(),
    body("MobileNumber").not().isEmpty(),
    body("Password").not().isEmpty(),
    body("ConfirmPassword").not().isEmpty(),
    body("GuardianOrParentName").not().isEmpty(),
    body("Email").not().isEmpty().isEmail(),
    body("Gender").not().isEmpty().isIn(["male", "female"]),
    body("DateofBirth").not().isEmpty(),
    body("Education").not().isEmpty(),
    body("Class").not().isEmpty(),
    body("Syllabus").not().isEmpty(),
    body("Department").not().isEmpty(),
    body("Semester").not().isEmpty(),
    body("SchoolOrCollegeName").not().isEmpty(),
    body("SchoolOrCollegeAddress").not().isEmpty(),
    body("Pincode").not().isEmpty(),
    body("Country").not().isEmpty(),
    body("State").not().isEmpty(),
    body("District").not().isEmpty(),
    body("Language").not().isEmpty(),
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
  register,
  validate,
};
