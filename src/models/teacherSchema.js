const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  code: {
    type: Number,
  },
  expired: {
    type: Boolean,
  },
});

const teacherSchema = mongoose.Schema(
  {
    Role: {
      type: Number,
      default: 1,
    },
    ProfileImage: {
      type: String,
    },
    IDProof: {
      type: String,
    },
    Name: {
      type: String,
    },
    MobileNumber: {
      type: String,
    },
    Password: {
      type: String,
    },
    ConfirmPassword: {
      type: String,
    },
    Email: {
      type: String,
    },
    Gender: {
      type: String,
    },
    DateofBirth: {
      type: String,
    },
    Qualification: {
      type: String,
    },
    Designation: {
      type: String,
    },
    Class: {
      type: String,
    },
    Syllabus: {
      type: String,
    },
    Course: {
      type: String,
    },
    Department: {
      type: String,
    },
    Semester: {
      type: String,
    },
    Subjects: {
      type: String,
    },
    SchoolOrCollegeName: {
      type: String,
    },
    SchoolOrCollegeAddress: {
      type: String,
    },
    Pincode: {
      type: String,
    },
    Country: {
      type: String,
    },
    State: {
      type: String,
    },
    District: {
      type: String,
    },
    Language: {
      type: String,
    },
    token: {
      type: String,
    },
    MobileNumberVerified: {
      type: Boolean,
    },
    otp: [otpSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teachers", teacherSchema);
