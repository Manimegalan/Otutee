const express = require("express");
const commonController = express.Router();
const mongoose = require('mongoose')

const { getDB } = require("../middleware/dbConnection");
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

commonController.get("/countries", async (req, res) => {
  try {
    const db = getDB();
    const data = await db
      .collection("countriesstatecity")
      .find({}, { projection: { name: 1 } })
      .toArray();
    sendResponse(res, 200, "Success", {
      message: "Countries retrived successfully!",
      data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

commonController.get("/statesCities/:id", async (req, res) => {
  try {
    const db = getDB();
    const data = await db
      .collection("countriesstatecity")
      .find({ _id: new mongoose.Types.ObjectId(req.params.id) }, { projection: { _id:0, states: 1 } })
      .toArray();
    sendResponse(res, 200, "Success", {
      message: "States and Cities retrived successfully!",
      data: data[0].states,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = commonController;
