const express = require("express");
const commonController = express.Router();

const { upload } = require("../middleware/common");
const { sendResponse } = require("../utils/common");

commonController.post("/upload", upload("Media").any(), async (req, res) => {
  try {
    const data = req.files.map((file) => ({
      fileName: file.originalname,
      location: file.location,
    }));
    sendResponse(res, 200, "Success", {
      message: "File uploaded successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = commonController;
