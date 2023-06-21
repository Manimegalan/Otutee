const express = require("express");
const router = express.Router();

const { auth } = require("./middleware/common");

const studentController = require("./controllers/studentController");
const teacherController = require("./controllers/teacherController");
const instituteController = require("./controllers/instituteController");
const educationController = require("./controllers/educationController");
const dashboardController = require("./controllers/dashboardController");
const postController = require("./controllers/postController");

router.use("/user/student", studentController);
router.use("/user/teacher", teacherController);
router.use("/user/institute", instituteController);

router.use("/education", educationController);

router.use("/dashboard/post", auth, dashboardController);
router.use("/subjects/post", auth, postController);

module.exports = router;
