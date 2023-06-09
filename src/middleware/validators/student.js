const { body, oneOf, validationResult } = require("express-validator");

const register = () => {
  return [
    body("Name").not().isEmpty(),
    body("MobileNumber").not().isEmpty(),
    body("Password").not().isEmpty(),
    body("ConfirmPassword").not().isEmpty(),
    body("GuardianOrParentName").not().isEmpty(),
    body("Email").not().isEmpty().isEmail(),
    body("Gender").not().isEmpty().isIn(["male", "female"]),
    body("DateofBirth").not().isEmpty(),
    body("Education").not().isEmpty(),
    body("Class"),
    body("Syllabus"),
    body("Department"),
    body("Semester"),
    body("SchoolOrCollegeName").not().isEmpty(),
    body("SchoolOrCollegeAddress").not().isEmpty(),
    body("Pincode").not().isEmpty(),
    body("Country").not().isEmpty(),
    body("State").not().isEmpty(),
    body("District").not().isEmpty(),
    body("Language").not().isEmpty(),
  ];
};

const verifyMobileNumber = () => {
  return [body("MobileNumber").not().isEmpty(), body("OTP").not().isEmpty()];
};

const signin = () => {
  return [
    body("Email").not().isEmpty().isEmail(),
    body("Password").not().isEmpty(),
  ];
};

const forgotPassword = () => {
  return [
    oneOf([body("Email").exists().isEmail(), body("MobileNumber").exists()]),
  ];
};

const resetPassword = () => {
  return [
    oneOf([body("Email").exists().isEmail(), body("MobileNumber").exists()]),
    body("OTP").not().isEmpty(),
    body("Password").not().isEmpty(),
    body("ConfirmPassword").not().isEmpty(),
  ];
};

const sendOtp = () => {
  return [body("MobileNumber").not().isEmpty()];
};

const verifyOtp = () => {
  return [
    oneOf([body("Email").exists().isEmail(), body("MobileNumber").exists()]),
  ];
};

const update = () => {
  return [
    body("Name"),
    body("DateofBirth"),
    // body("MobileNumber"),
    // body("Email").optional().isEmail(),
    body("Password"),
    body("ConfirmPassword"),
    body("Education"),
    body("Class"),
    body("Syllabus"),
    body("Department"),
    body("Semester"),
    body("SchoolOrCollegeAddress"),
    body("Pincode"),
    body("Country"),
    body("State"),
    body("District"),
    body("Language"),
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
  verifyMobileNumber,
  signin,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  update,
  validate,
};
