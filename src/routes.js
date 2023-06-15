const express = require("express");
const router = express.Router();

const { auth } = require("./middleware/common");

const studentController = require("./controllers/studentController");
const teacherController = require("./controllers/teacherController");
const instituteController = require("./controllers/instituteController");

router.use("/user/student", studentController);
router.use("/user/teacher", teacherController);
router.use("/user/institute", instituteController);

module.exports = router;
