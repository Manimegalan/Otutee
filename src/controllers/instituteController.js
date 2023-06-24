const express = require("express");
const instituteController = express.Router();

const { upload } = require("../middleware/common");
const instituteValidator = require("../middleware/validators/institute");
const instituteService = require("../services/userService");
const {
  sendResponse,
  createHash,
  compareHash,
  createJwtToken,
  sendMail,
  generateOTP,
  sendOtp,
} = require("../utils/common");

instituteController.post(
  "/register",
  upload("Teacher").any("files"),
  instituteValidator.register(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const data = {
        Role: "institute",
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
      data.MobileNumberVerified = false;
      const instituteCreated = await instituteService.create(data);
      instituteCreated.set("Password", undefined);
      instituteCreated.set("ConfirmPassword", undefined);
      sendResponse(res, 200, "Success", {
        message: "Institute registered successfully!",
        data: instituteCreated,
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
  "/verifyMobileNumber",
  instituteValidator.verifyMobileNumber(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      let otpIndex;
      const { MobileNumber, OTP } = req.body;
      const isMobileNumberExist = await instituteService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Institute not found!",
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

      await instituteService.updateOne(
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

instituteController.post(
  "/signin",
  instituteValidator.signin(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const { Email, Password } = req.body;
      const isEmailExist = await instituteService.findOne({ Email });
      if (!isEmailExist || isEmailExist.Role !== "institute") {
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
      if (!isEmailExist.MobileNumberVerified) {
        return sendResponse(res, 400, "Failed", {
          message: "Please Verify your mobile number!",
        });
      }
      const { _id, Name, Role } = isEmailExist;
      const token = createJwtToken({ _id, Name, Email, Role }, "1d");
      await instituteService.updateOne({ _id }, { token });
      sendResponse(res, 200, "Success", {
        message: "Logged in successfully!",
        data: { token, _id, Email, Name, Role },
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
      const { Email, MobileNumber } = req.body;
      const $or = [];
      Email
        ? $or.push({ Email })
        : MobileNumber
        ? $or.push({ MobileNumber })
        : null;

      const isUserExist = await instituteService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect email/mobile number or institute not found!",
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

      await instituteService.updateOne(req.body, {
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

instituteController.post(
  "/resetPassword",
  instituteValidator.resetPassword(),
  instituteValidator.validate,
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

      const isUserExist = await instituteService.findOne({ $or });
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

      await instituteService.updateOne(
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

instituteController.post(
  "/sendOtp",
  instituteValidator.sendOtp(),
  instituteValidator.validate,
  async (req, res) => {
    try {
      const { MobileNumber } = req.body;
      const code = generateOTP();
      const isMobileNumberExist = await instituteService.findOne({
        MobileNumber,
      });
      if (!isMobileNumberExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Mobile number or Institute not found!",
        });
      }
      const response = await sendOtp(MobileNumber, code);

      await instituteService.updateOne(
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

instituteController.post(
  "/verifyOtp",
  instituteValidator.verifyOtp(),
  instituteValidator.validate,
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

      const isUserExist = await instituteService.findOne({ $or });
      if (!isUserExist) {
        return sendResponse(res, 400, "Failed", {
          message: "Incorrect Email/Mobile number or Institute not found!",
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

module.exports = instituteController;
