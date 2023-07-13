const express = require("express");
const studentController = express.Router();

const { auth, localUpload, s3Upload } = require("../middleware/common");
const studentValidator = require("../middleware/validators/student");
const studentService = require("../services/userService");
const educationService = require("../services/educationService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  sendOtp,
  generateOTP,
} = require("../utils/common");

studentController.post(
  "/register",
  localUpload("student").fields([
    { name: "ProfileImage", maxCount: 1 },
    { name: "IdProof", maxCount: 1 },
  ]),
  studentValidator.register(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: "student",
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
      const studentCreated = await studentService.create(data);
      studentCreated.set("Password", undefined);
      studentCreated.set("ConfirmPassword", undefined);

      if (req?.files?.ProfileImage?.[0]) {
        const ProfileImage = await s3Upload({
          location: `student/${studentCreated._id}`,
          file: req.files.ProfileImage[0],
        });
        await studentService.updateOne(
          { _id: studentCreated._id },
          { ProfileImage }
        );
        studentCreated.set("ProfileImage", ProfileImage);
      }
      if (req?.files?.IdProof?.[0]) {
        const IDProof = await s3Upload({
          location: `student/${studentCreated._id}`,
          file: req.files.IdProof[0],
        });
        await studentService.updateOne(
          { _id: studentCreated._id },
          { IDProof }
        );
        studentCreated.set("IDProof", IDProof);
      }

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
  "/verifyMobileNumber",
  studentValidator.verifyMobileNumber(),
  studentValidator.validate,
  async (req, res) => {
    try {
      let otpIndex;
      const { MobileNumber, OTP } = req.body;
      const isMobileNumberExist = await studentService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Student not found!",
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

      await studentService.updateOne(
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

studentController.post(
  "/signin",
  studentValidator.signin(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const isEmailExist = await studentService.findOne({ Email });
      if (!isEmailExist || isEmailExist.Role !== "student") {
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
      if (!isEmailExist.MobileNumberVerified) {
        return sendResponse(res, 400, "Failed", {
          message: "Please Verify your mobile number!",
        });
      }
      const { _id, Name, Role, Education, EducationType, Class, token } =
        isEmailExist;
      if (token) {
        return sendResponse(res, 401, "Failed", {
          message: "Access denied. Multiple sessions not allowed.",
        });
      }
      const jwtToken = createJwtToken(
        { _id, Name, Email, Role, Education, EducationType, Class },
        "1d"
      );
      await studentService.updateOne({ _id }, { token: jwtToken });
      sendResponse(res, 200, "Success", {
        message: "Logged in successfully!",
        data: { token: jwtToken, _id, Email, Name, Role, Education, Class },
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

studentController.post("/signout", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    await studentService.updateOne({ _id }, { token: null });
    sendResponse(res, 200, "Success", {
      message: "Logged out successfully!"
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

studentController.post(
  "/forgotPassword",
  studentValidator.forgotPassword(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { Email, MobileNumber } = req.body;
      const $or = [];
      Email
        ? $or.push({ Email })
        : MobileNumber
        ? $or.push({ MobileNumber })
        : null;

      const isUserExist = await studentService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email/mobile number or teacher not found!",
        });
      }
      let data;
      const code = generateOTP();

      if (req.body.Email) {
        data = await sendMail(isUserExist.Email, code);
      } else if (req.body.MobileNumber) {
        const response = await sendOtp(MobileNumber, code);
        data = response.data;
      }

      await studentService.updateOne(req.body, {
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

studentController.post(
  "/resetPassword",
  studentValidator.resetPassword(),
  studentValidator.validate,
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

      const isUserExist = await studentService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Email/Mobile number or Student not found!",
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

      await studentService.updateOne(
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

studentController.post(
  "/sendOtp",
  studentValidator.sendOtp(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { MobileNumber } = req.body;
      const code = generateOTP();
      const isMobileNumberExist = await studentService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Student not found!",
        });
      }
      const response = await sendOtp(MobileNumber, code);

      await studentService.updateOne(
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

studentController.post(
  "/verifyOtp",
  studentValidator.verifyOtp(),
  studentValidator.validate,
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

      const isUserExist = await studentService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Email/Mobile number or Student not found!",
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

studentController.post(
  "/update",
  auth,
  localUpload("Student").fields([
    { name: "ProfileImage", maxCount: 1 },
    { name: "IdProof", maxCount: 1 },
  ]),
  studentValidator.update(),
  studentValidator.validate,
  async (req, res) => {
    try {
      const { _id } = req.user;
      const data = {
        Name: req.body.Name,
        // MobileNumber: req.body.MobileNumber,
        // Email: req.body.Email,
        Password: req.body.Password,
        ConfirmPassword: req.body.ConfirmPassword,
        GuardianOrParentName: req.body.GuardianOrParentName,
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
      const isUserExist = await studentService.findOne({ _id });
      if (!isUserExist || isUserExist.Role !== "student") {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email or Student not found!",
        });
      }
      data.Password && (data.Password = createHash(data.Password));
      data.ConfirmPassword &&
        (data.ConfirmPassword = btoa(data.ConfirmPassword));
      const studentCreated = await studentService.updateOne({ _id }, data);

      if (req?.files?.ProfileImage?.[0]) {
        const ProfileImage = await s3Upload({
          location: `student/${_id}`,
          file: req.files.ProfileImage[0],
        });
        await studentService.updateOne({ _id }, { ProfileImage });
      }
      if (req?.files?.IdProof?.[0]) {
        const IDProof = await s3Upload({
          location: `student/${_id}`,
          file: req.files.IdProof[0],
        });
        await studentService.updateOne({ _id }, { IDProof });
      }

      sendResponse(res, 200, "Success", {
        message: "Student updated successfully!",
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

studentController.post("/info", auth, async (req, res) => {
  try {
    const { _id } = req.user;
    const isUserExist = await studentService.findOne({ _id });
    if (!isUserExist || isUserExist.Role !== "student") {
      return sendResponse(res, 400, "Failed", {
        message: "Incorrect email or Student not found!",
      });
    }
    isUserExist.set("Password", undefined);
    isUserExist.set("ConfirmPassword", undefined);
    isUserExist.set("token", undefined);
    sendResponse(res, 200, "Success", {
      message: "Student retrieved successfully!",
      data: isUserExist,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = studentController;
