const express = require("express");
const postController = express.Router();

const postValidator = require("../middleware/validators/post");
const postService = require("../services/postService");
const { sendResponse } = require("../utils/common");

postController.post(
  "/create",
  postValidator.create(),
  postValidator.validate,
  (req, res) => {
    try {
      sendResponse(res, 200, "Success", {
        message: "Post created successfully!",
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
  }
);

module.exports = postController;
