const express = require("express");
const router = express.Router();

const { auth } = require("./middleware/common");

const studentController = require("./controllers/studentController");
const teacherController = require("./controllers/teacherController");
const instituteController = require("./controllers/instituteController");
const educationController = require("./controllers/educationController");
const dashboardController = require("./controllers/dashboardController");
const postController = require("./controllers/postController");
const commonController = require("./controllers/commonController");
const toppersController = require("./controllers/toppersController");

router.use("/user/student", studentController);
router.use("/user/teacher", teacherController);
router.use("/user/institute", instituteController);

router.use("/education", educationController);

router.use("/dashboard/post", auth, dashboardController);
router.use("/subjects/post", auth, postController);

router.use("/institute/toppers", auth, toppersController)

router.use("/media", auth, commonController);

module.exports = router;
