const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

exports.sendResponse = (res, code, message, data) => {
  const response = {
    status: {
      code,
      message,
    },
  };
  if (data) {
    response.data = data;
  }
  return res.status(code).json(response);
};

exports.createHash = (data) => {
  return bcrypt.hashSync(data, bcrypt.genSaltSync(10));
};

exports.compareHash = (data, hashData) => {
  return bcrypt.compareSync(data, hashData);
};

exports.createJwtToken = (data, expiresIn) => {
  return jwt.sign(data, process.env.JWT_KEY, { expiresIn });
};

exports.verifyJwtToken = (data) => {
  return jwt.verify(data, process.env.JWT_KEY);
};

exports.sendMail = async (Email, code) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"Otutee" <${process.env.NODEMAILER_USERNAME}>`,
    to: Email,
    subject: "Reset password",
    text: "Reset password",
    html: `<b>Dear Customer, ${code} is the OTP to register as a Customer. OTPs are secret. Please DO NOT disclose it to anyone. Team Mitrakart</b>`,
  });
  return info;
};

exports.generateOTP = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const urlParams = (obj) => {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      params.append(key, obj[key]);
    }
  }
  return params.toString();
};

exports.sendOtp = async (MobileNumber, code) => {
  const { EXOTEL_KEY, EXOTEL_TOKEN, EXOTEL_SUBDOMAIN, EXOTEL_SID } =
    process.env;

  const data = {
    From: process.env.EXOTEL_FROM,
    To: MobileNumber,
    Body: `Dear Customer, ${code} is the OTP to register as a Customer. OTPs are secret. Please DO NOT disclose it to anyone. Team Mitrakart`,
    DltEntityId: process.env.EXOTEL_DLTTEMPLATEID,
  };

  const url = `http://${EXOTEL_KEY}:${EXOTEL_TOKEN}${[
    EXOTEL_SUBDOMAIN,
  ]}/v1/Accounts/${EXOTEL_SID}/Sms/send`;

  return await axios.post(url, urlParams(data), {
    withCredentials: true,
    headers: {
      Accept: "application/x-www-form-urlencoded",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};
