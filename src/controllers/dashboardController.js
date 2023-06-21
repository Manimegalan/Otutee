const express = require("express");
const dashboardController = express.Router();

const dashboardValidator = require("../middleware/validators/dashboard");
const dashboardService = require("../services/dashboardService");
const { sendResponse } = require("../utils/common");

dashboardController.post(
  "/create",
  dashboardValidator.create(),
  dashboardValidator.validate,
  async (req, res) => {
    try {
      req.body.Author = req.user._id;
      const data = await dashboardService.create(req.body);
      sendResponse(res, 200, "Success", {
        message: "Post created successfully!",
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

dashboardController.get("/", async (req, res) => {
  try {
    const data = await dashboardService.find();
    sendResponse(res, 200, "Success", {
      message: "Post retrieved successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

dashboardController.post(
  "/update",
  dashboardValidator.update(),
  dashboardValidator.validate,
  async (req, res) => {
    try {
      const data = await dashboardService.updateOne(
        { _id: req.body.PostId },
        { $set: req.body }
      );
      sendResponse(res, 200, "Success", {
        message: "Post updated successfully!",
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

dashboardController.delete(
  "/delete",
  dashboardValidator.deletePost(),
  dashboardValidator.validate,
  async (req, res) => {
    try {
      const data = await dashboardService.deleteOne({ _id: req.body.PostId });
      sendResponse(res, 200, "Success", {
        message: "Post deleted successfully!",
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

module.exports = dashboardController;
