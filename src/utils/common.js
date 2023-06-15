const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

exports.sendMail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <manimegalan@gmail.com>',
    to: "manimegalan@gmail.com",
    subject: "Reset password",
    text: "Reset password",
    html: `<b>${data}</b>`,
  });
  return info;
};
