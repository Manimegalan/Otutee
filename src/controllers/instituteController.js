const express = require("express");
const instituteController = express.Router();

const { upload } = require("../middleware/common");
const instituteValidator = require("../middleware/validators/institute");
const instituteService = require("../services/instituteService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  verifyJwtToken,
} = require("../utils/common");

instituteController.post(
  "/register",
  upload("Teacher").any("files"),
  instituteValidator.register(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: 2,
        ProfileImage: req.files[0]?.filename,
        IDProof: req.files[1]?.filename,
        Organization: req.body.Organization,
        Institute: req.body.Institute,
        InstituteName: req.body.InstituteName,
        AdministratorName: req.body.AdministratorName,
        MobileNumber: req.body.MobileNumber,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Email: req.body.Email,
        InstituteWebsite: req.body.InstituteWebsite,
        InstituteAddress: req.body.InstituteAddress,
        Pincode: req.body.Pincode,
        Country: req.body.Country,
        State: req.body.State,
        District: req.body.District,
        Language: req.body.Language,
      };
      if (!req.files[1]) {
        return sendResponse(res, 400, "Failed", {
          message: "Please upload ProfileImage and IDProof",
        });
      }
      const isEmailExist = await instituteService.findOne({
        Email: data.Email,
      });
      if (isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Email already exist! Please register with another Email",
        });
      }
      const isMobileNumberExist = await instituteService.findOne({
        MobileNumber: data.MobileNumber,
      });
      if (isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message:
            "MobileNumber already exist! Please register with another MobileNumber",
        });
      }
      data.Password = createHash(data.Password);
      data.ConfirmPassword = btoa(data.ConfirmPassword);
      const teacherCreated = await instituteService.create(data);
      sendResponse(res, 200, "Success", {
        message: "Institute registered successfully!",
        data: teacherCreated,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

instituteController.post(
  "/signin",
  instituteValidator.signin(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const isEmailExist = await instituteService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or institute not found!",
        });
      }
      const isPasswordMatch = compareHash(Password, isEmailExist.Password);
      if (!isPasswordMatch) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect password!",
        });
      }
      const { _id, Name, Role } = isEmailExist;
      const token = createJwtToken({ _id, Name, Email, Role }, "1d");
      await instituteService.updateOne({ _id }, { token });
      sendResponse(res, 200, "Success", {
        message: "Logged in successfully!",
        data: { _id, Email, Name, token },
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

instituteController.post(
  "/forgotPassword",
  instituteValidator.forgotPassword(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const { Email } = req.body;
      const isEmailExist = await instituteService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or institute not found!",
        });
      }
      const { _id, Name } = isEmailExist;
      const resetLink =
        process.env.FRONTEND_URL +
        "/resetpassword/" +
        createJwtToken({ _id, Name, Email }, "10m");
      const info = await sendMail(resetLink);
      sendResponse(res, 200, "Success", {
        message: "Email sent successfully!",
        data: info,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

instituteController.post(
  "/resetPassword",
  instituteValidator.resetPassword(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const { Password, ResetString } = req.body;
      const decoded = verifyJwtToken(ResetString);
      if (decoded) {
        await instituteService.updateOne(
          { _id: decoded._id },
          { Password: createHash(Password), ConfirmPassword: btoa(Password) }
        );
        sendResponse(res, 200, "Success", {
          message: "Password reset successfully!",
        });
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

module.exports = instituteController;
