const jwt = require("jsonwebtoken");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const { sendResponse } = require("../utils/common");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return sendResponse(res, 403, "Failed", {
      message: "Authorization token not found!",
    });
  }
  if (!authHeader?.startsWith("Bearer "))
    return sendResponse(res, 403, "Failed", {
      message: "Invalid authorization method!",
    });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err)
      return sendResponse(res, 403, "Failed", {
        message: `Invalid Bearer token / ${err.message}`,
      });
    const { iat, exp, ...rest } = decoded;
    req.user = rest;
    next();
  });
};

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Unsupported file format!"));
  }
  cb(null, true);
};

// Local Storage

const upload = (location) =>
  multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const folderPath = `Public/${location}/`;
        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
      },
      filename: function (req, file, cb) {
        cb(
          null,
          crypto.randomBytes(8).toString("hex") +
            file.originalname +
            path.extname(file.originalname)
        );
      },
    }),
    fileFilter,
  });

// S3 Upload

// const upload = multer({
//   storage: multerS3({
//     s3: new S3Client({
//       region: process.env.AWS_BUCKET_REGION,
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       },
//     }),
//     bucket: process.env.AWS_BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     acl: "public-read",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(
//         null,
//         crypto.randomBytes(16).toString("hex") + path.extname(file.originalname)
//       );
//     },
//   }),
//   fileFilter,
// });

module.exports = { auth, upload };
