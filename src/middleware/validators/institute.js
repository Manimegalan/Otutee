const { body, validationResult } = require("express-validator");

const register = () => {
  return [
    body("Organization").not().isEmpty(),
    body("Institute").not().isEmpty(),
    body("InstituteName").not().isEmpty(),
    body("AdministratorName").not().isEmpty(),
    body("MobileNumber").not().isEmpty(),
    body("Password").not().isEmpty(),
    body("ConfirmPassword").not().isEmpty(),
    body("Email").not().isEmpty().isEmail(),
    body("InstituteWebsite").not().isEmpty(),
    body("InstituteAddress").not().isEmpty(),
    body("Pincode").not().isEmpty(),
    body("Country").not().isEmpty(),
    body("State").not().isEmpty(),
    body("District").not().isEmpty(),
    body("Language").not().isEmpty(),
  ];
};

const signin = () => {
  return [
    body("Email").not().isEmpty().isEmail(),
    body("Password").not().isEmpty(),
  ];
};

const forgotPassword = () => {
  return [body("Email").not().isEmpty().isEmail()];
};

const resetPassword = () => {
  return [
    body("Password").not().isEmpty(),
    body("ResetString").not().isEmpty(),
  ];
};

const sendOtp = () => {
  return [body("MobileNumber").not().isEmpty()];
};

const verifyOtp = () => {
  return [body("MobileNumber").not().isEmpty(), body("OTP").not().isEmpty()];
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
  signin,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  validate,
};
