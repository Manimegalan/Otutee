const express = require("express");
const toppersController = express.Router();

const toppersValidator = require("../middleware/validators/toppers");
const toppersServices = require("../services/toppersServices");

const { sendResponse } = require("../utils/common");

toppersController.get("/", async (req, res) => {
  try {
    if (req?.user?.Role !== "institute") {
      return sendResponse(res, 401, "Failed", {
        message: "Unauthorized access!",
      });
    }
    const data = await toppersServices.find();
    sendResponse(res, 200, "Success", {
      message: "Toppers retrieved successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

toppersController.post(
  "/add",
  toppersValidator.addTopper(),
  toppersValidator.validate,
  async (req, res) => {
    try {
      if (req?.user?.Role !== "institute") {
        return sendResponse(res, 401, "Failed", {
          message: "Unauthorized access!",
        });
      }
      const data = await toppersServices.create(req.body);
      sendResponse(res, 200, "Success", {
        message: "Topper added successfully!",
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

toppersController.post("/update", async (req, res) => {
  try {
    if (req?.user?.Role !== "institute") {
      return sendResponse(res, 401, "Failed", {
        message: "Unauthorized access!",
      });
    }
    const data = await toppersServices.updateOne(
      { _id: req.body._id },
      req.body
    );
    sendResponse(res, 200, "Success", {
      message: "Topper updated successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

toppersController.delete("/delete", async (req, res) => {
  try {
    if (req?.user?.Role !== "institute") {
      return sendResponse(res, 401, "Failed", {
        message: "Unauthorized access!",
      });
    }
    const data = await toppersServices.deleteOne({ _id: req.body._id });
    sendResponse(res, 200, "Success", {
      message: "Topper deleted successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = toppersController;
