const express = require("express");
const teacherController = express.Router();

const { upload } = require("../middleware/common");
const teacherValidator = require("../middleware/validators/teacher");
const teacherService = require("../services/teacherService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  verifyJwtToken,
  generateOTP,
  sendOtp,
} = require("../utils/common");

teacherController.post(
  "/register",
  upload("Teacher").any("files"),
  teacherValidator.register(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: 1,
        ProfileImage: req.files[0]?.filename,
        IDProof: req.files[1]?.filename,
        Name: req.body.Name,
        MobileNumber: req.body.MobileNumber,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Email: req.body.Email,
        Gender: req.body.Gender,
        DateofBirth: req.body.DateofBirth,
        Qualification: req.body.Qualification,
        Designation: req.body.Designation,
        Class: req.body.Class,
        Syllabus: req.body.Syllabus,
        Course: req.body.Course,
        Department: req.body.Department,
        Semester: req.body.Semester,
        Subjects: req.body.Subjects,
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
      const isEmailExist = await teacherService.findOne({ Email: data.Email });
      if (isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Email already exist! Please register with another Email",
        });
      }
      const isMobileNumberExist = await teacherService.findOne({
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
      const teacherCreated = await teacherService.create(data);
      sendResponse(res, 200, "Success", {
        message: "Teacher registered successfully!",
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

teacherController.post(
  "/signin",
  teacherValidator.signin(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const isEmailExist = await teacherService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or teacher not found!",
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
      await teacherService.updateOne({ _id }, { token });
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

teacherController.post(
  "/forgotPassword",
  teacherValidator.forgotPassword(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { Email } = req.body;
      const isEmailExist = await teacherService.findOne({ Email });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or teacher not found!",
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

teacherController.post(
  "/resetPassword",
  teacherValidator.resetPassword(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { Password, ResetString } = req.body;
      const decoded = verifyJwtToken(ResetString);
      if (decoded) {
        await teacherService.updateOne(
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

teacherController.post(
  "/sendOtp",
  teacherValidator.sendOtp(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { MobileNumber } = req.body;
      const code = generateOTP();
      const isMobileNumberExist = await teacherService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Teacher not found!",
        });
      }
      const response = await sendOtp(MobileNumber, code);

      await teacherService.updateOne(
        {
          MobileNumber,
        },
        {
          $push: {
            otp: {
              code,
              expired: false,
            },
          },
        }
      );

      sendResponse(res, 200, "Success", {
        message: "OTP sent successfully!",
        data: response.data,
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

teacherController.post(
  "/verifyOtp",
  teacherValidator.verifyOtp(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      let otpIndex;
      const { MobileNumber, OTP } = req.body;
      const isMobileNumberExist = await teacherService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Teacher not found!",
        });
      }
      const otpData = isMobileNumberExist.otp.find((obj, index) => {
        if (obj.code === OTP) {
          otpIndex = index;
          return true;
        }
      });
      if (!otpData) {
        return sendResponse(res, 400, "Failed", {
          message: "Invalid OTP!",
        });
      }
      if (otpData.expired) {
        return sendResponse(res, 400, "Failed", {
          message: "OTP expired!",
        });
      }

      const { _id, Name, Email, Role } = isMobileNumberExist;
      const token = createJwtToken({ _id, Name, Email, Role }, "1d");
      await teacherService.updateOne(
        { _id },
        {
          $set: {
            token,
            [`otp.${otpIndex}.expired`]: true,
          },
        }
      );

      sendResponse(res, 200, "Success", {
        message: "OTP verified & Logged in successfully!",
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

module.exports = teacherController;
