const express = require("express");
const teacherController = express.Router();

const { auth, localUpload, s3Upload } = require("../middleware/common");
const teacherValidator = require("../middleware/validators/teacher");
const teacherService = require("../services/userService");
const educationService = require("../services/educationService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  generateOTP,
  sendOtp,
} = require("../utils/common");

teacherController.post(
  "/register",
  localUpload("teacher").fields([
    { name: "ProfileImage", maxCount: 1 },
    { name: "IdProof", maxCount: 1 },
  ]),
  teacherValidator.register(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: "teacher",
        Name: req.body.Name,
        MobileNumber: req.body.MobileNumber,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Email: req.body.Email,
        Gender: req.body.Gender,
        DateofBirth: req.body.DateofBirth,
        Qualification: req.body.Qualification,
        Designation: req.body.Designation,
        Education: req.body.Education,
        Class: req.body.Class,
        Syllabus: req.body.Syllabus,
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
      const educationRes = await educationService.findOne({
        _id: req.body.Education,
      });
      if (!educationRes) {
        return sendResponse(res, 400, "Failed", {
          message: "Invalid education",
        });
      }
      data.EducationType = educationRes.Type;
      data.Password = createHash(data.Password);
      data.ConfirmPassword = btoa(data.ConfirmPassword);
      data.MobileNumberVerified = false;
      const teacherCreated = await teacherService.create(data);
      teacherCreated.set("Password", undefined);
      teacherCreated.set("ConfirmPassword", undefined);

      if (req?.files?.ProfileImage?.[0]) {
        const ProfileImage = await s3Upload({
          location: `teacher/${teacherCreated._id}`,
          file: req.files.ProfileImage[0],
        });
        await teacherService.updateOne(
          { _id: teacherCreated._id },
          { ProfileImage }
        );
        teacherCreated.set("ProfileImage", ProfileImage);
      }
      if (req?.files?.IdProof?.[0]) {
        const IDProof = await s3Upload({
          location: `teacher/${teacherCreated._id}`,
          file: req.files.IdProof[0],
        });
        await teacherService.updateOne(
          { _id: teacherCreated._id },
          { IDProof }
        );
        teacherCreated.set("IDProof", IDProof);
      }

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
  "/verifyMobileNumber",
  teacherValidator.verifyMobileNumber(),
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

      await teacherService.updateOne(
        { _id: isMobileNumberExist._id },
        {
          $set: {
            MobileNumberVerified: true,
            [`otp.${otpIndex}.expired`]: true,
          },
        }
      );

      sendResponse(res, 200, "Success", {
        message: "Mobile Number verified successfully!",
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
      if (!isEmailExist || isEmailExist.Role !== "teacher") {
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
      if (!isEmailExist.MobileNumberVerified) {
        return sendResponse(res, 400, "Failed", {
          message: "Please Verify your mobile number!",
        });
      }
      const { _id, Name, Role, token } = isEmailExist;
      if (token) {
        return sendResponse(res, 401, "Failed", {
          message: "Access denied. Multiple sessions not allowed.",
        });
      }
      const jwtToken = createJwtToken({ _id, Name, Email, Role }, "1d");
      await teacherService.updateOne({ _id }, { token: jwtToken });
      sendResponse(res, 200, "Success", {
        message: "Logged in successfully!",
        data: { token: jwtToken, _id, Email, Name, Role },
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

teacherController.post("/signout", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    await teacherService.updateOne({ _id }, { token: null });
    sendResponse(res, 200, "Success", {
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

teacherController.post(
  "/forgotPassword",
  teacherValidator.forgotPassword(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { Email, MobileNumber } = req.body;
      const $or = [];
      Email
        ? $or.push({ Email })
        : MobileNumber
        ? $or.push({ MobileNumber })
        : null;

      const isEmailExist = await teacherService.findOne({ $or });
      if (!isEmailExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email/mobile number or teacher not found!",
        });
      }

      let data;
      const code = generateOTP();

      if (req.body.Email) {
        data = await sendMail(isEmailExist.Email, code);
      } else if (req.body.MobileNumber) {
        const response = await sendOtp(MobileNumber, code);
        data = response.data;
      }

      await teacherService.updateOne(req.body, {
        $push: {
          otp: {
            code,
            expired: false,
          },
        },
      });

      sendResponse(res, 200, "Success", {
        message: "OTP sent successfully!",
        data,
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
      const { Email, MobileNumber, OTP, Password, ConfirmPassword } = req.body;
      let otpIndex;
      const $or = [];

      Email
        ? $or.push({ Email })
        : MobileNumber
        ? $or.push({ MobileNumber })
        : null;

      const isUserExist = await teacherService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email/mobile number or teacher not found!",
        });
      }

      const otpData = isUserExist.otp.find((obj, index) => {
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

      await teacherService.updateOne(
        { _id: isUserExist._id },
        {
          $set: {
            Password: createHash(Password),
            ConfirmPassword: btoa(ConfirmPassword),
            [`otp.${otpIndex}.expired`]: true,
          },
        }
      );

      sendResponse(res, 200, "Success", {
        message: "Password reset successfully!",
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
      const { Email, MobileNumber, OTP } = req.body;
      const $or = [];

      Email
        ? $or.push({ Email })
        : MobileNumber
        ? $or.push({ MobileNumber })
        : null;

      const isMobileNumberExist = await teacherService.findOne({
        $or,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Email/Mobile number or Teacher not found!",
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

      sendResponse(res, 200, "Success", {
        message: "OTP verified successfully!",
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
  "/update",
  auth,
  localUpload("Teacher").fields([
    { name: "ProfileImage", maxCount: 1 },
    { name: "IdProof", maxCount: 1 },
  ]),
  teacherValidator.update(),
  teacherValidator.validate,
  async (req, res) => {
    try {
      const { _id } = req.user;
      const data = {
        Name: req.body.Name,
        // MobileNumber: req.body.MobileNumber,
        // Email: req.body.Email,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        Gender: req.body.Gender,
        DateofBirth: req.body.DateofBirth,
        Qualification: req.body.Qualification,
        Designation: req.body.Designation,
        Education: req.body.Education,
        Class: req.body.Class,
        Syllabus: req.body.Syllabus,
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
      const isUserExist = await teacherService.findOne({ _id });
      if (!isUserExist || isUserExist.Role !== "teacher") {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or Teacher not found!",
        });
      }

      data.Password && (data.Password = createHash(data.Password));
      data.ConfirmPassword &&
        (data.ConfirmPassword = btoa(data.ConfirmPassword));

      const teacherCreated = await teacherService.updateOne({ _id }, data);

      if (req.files.ProfileImage?.[0]) {
        const ProfileImage = await s3Upload({
          location: `teacher/${_id}`,
          file: req.files.ProfileImage[0],
        });
        await teacherService.updateOne({ _id }, { ProfileImage });
      }
      if (req.files.IdProof?.[0]) {
        const IDProof = await s3Upload({
          location: `teacher/${_id}`,
          file: req.files.IdProof[0],
        });
        await teacherService.updateOne({ _id }, { IDProof });
      }

      sendResponse(res, 200, "Success", {
        message: "Teacher updated successfully!",
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

teacherController.post("/info", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const isUserExist = await teacherService.findOne({ _id });
    if (!isUserExist || isUserExist.Role !== "teacher") {
      return sendResponse(res, 400, "Failed", {
        message: "Incorrect email or Teacher not found!",
      });
    }
    isUserExist.set("Password", undefined);
    isUserExist.set("ConfirmPassword", undefined);
    isUserExist.set("token", undefined);
    sendResponse(res, 200, "Success", {
      message: "Teacher retrieved successfully!",
      data: isUserExist,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = teacherController;
