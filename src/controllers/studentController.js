const express = require("express");
const studentController = express.Router();

const { upload } = require("../middleware/common");
const studentValidator = require("../middleware/validators/student");
const studentService = require("../services/studentService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  verifyJwtToken,
} = require("../utils/common");

studentController.post(
  "/register",
  upload("student").any("files"),
  studentValidator.register(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: 0,
        ProfileImage: req.files[0]?.filename,
        IDProof: req.files[1]?.filename,
        Name: req.body.Name,
        MobileNumber: req.body.MobileNumber,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        GuardianOrParentName: req.body.GuardianOrParentName,
        Email: req.body.Email,
        Gender: req.body.Gender,
        DateofBirth: req.body.DateofBirth,
        Education: req.body.Education,
        Class: req.body.Class,
        Syllabus: req.body.Syllabus,
        Department: req.body.Department,
        Semester: req.body.Semester,
        SchoolOrCollegeName: req.body.SchoolOrCollegeName,
        SchoolOrCollegeAddress: req.body.SchoolOrCollegeAddress,
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
      const isEmailExist = await studentService.findOne({ Email: data.Email });
      if (isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Email already exist! Please register with another Email",
        });
      }
      const isMobileNumberExist = await studentService.findOne({
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
      const studentCreated = await studentService.create(data);
      sendResponse(res, 200, "Success", {
        message: "Student registered successfully!",
        data: studentCreated,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

studentController.post(
  "/signin",
  studentValidator.signin(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const isEmailExist = await studentService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or Student not found!",
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
      await studentService.updateOne({ _id }, { token });
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

studentController.post(
  "/forgotPassword",
  studentValidator.forgotPassword(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { Email } = req.body;
      const isEmailExist = await studentService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or Student not found!",
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

studentController.post(
  "/resetPassword",
  studentValidator.resetPassword(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { Password, ResetString } = req.body;
      const decoded = verifyJwtToken(ResetString);
      if (decoded) {
        await studentService.updateOne(
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

module.exports = studentController;
