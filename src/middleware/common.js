const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");

const multer = require("multer");
const multerS3 = require("multer-s3");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const { publicFilesList } = require("../utils/constants");
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
  if (
    !file.mimetype.startsWith("image/") &&
    !file.mimetype.startsWith("video/") &&
    file.mimetype !== "application/pdf"
  ) {
    return cb(new Error("Unsupported file format!"));
  }
  cb(null, true);
};

const localUpload = (location) =>
  multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const folderPath = `Public/${location}/${file?.fieldname}`;
        fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
      },
      filename: function (req, file, cb) {
        cb(
          null,
          crypto.randomBytes(8).toString("hex") + "_" + file.originalname
        );
      },
    }),
    fileFilter,
  });

const upload = (location) =>
  multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      contentType: function (req, file, cb) {
        const mimeTypes = { mp4: "video/mp4" };
        const fileExt = file.originalname.split(".").pop();
        const contentType = mimeTypes[fileExt] || multerS3.AUTO_CONTENT_TYPE;
        cb(null, contentType);
      },
      acl: function (req, file, cb) {
        const isPublicFile = publicFilesList.includes(file.fieldname);
        if (isPublicFile) {
          cb(null, "public-read");
        } else {
          cb(null, "private");
        }
      },
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(
          null,
          `${req.user.Role}/${req.user._id}/${location}/${
            file?.fieldname
          }/${crypto.randomBytes(8).toString("hex")}_${file.originalname}`
        );
      },
    }),
    fileFilter,
  });

const s3Upload = async ({ file, location }) => {
  const Key = `${location}/${file?.fieldname}/${crypto
    .randomBytes(8)
    .toString("hex")}_${file.originalname}`;
  const Body = fs.readFileSync(file.path);
  const ACL = publicFilesList.includes(file.fieldname)
    ? "public-read"
    : "private";
  const ContentType = file.mimetype;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL,
      ContentType,
      Key,
      Body,
    })
  );
  fs.unlinkSync(file.path);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${Key}`;
};

module.exports = { auth, upload, localUpload, s3Upload };
