const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  code: {
    type: Number,
  },
  expired: {
    type: Boolean,
  },
});

const studentSchema = mongoose.Schema(
  {
    Role: {
      type: Number,
      default: 0,
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
    GuardianOrParentName: {
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
    Education: {
      type: String,
    },
    Class: {
      type: String,
    },
    Syllabus: {
      type: String,
    },
    Department: {
      type: String,
    },
    Semester: {
      type: String,
    },
    SchoolOrCollegeName: {
      type: String,
    },
    SchoolOrCollegeAddress: {
      type: String,
    },
    Pincode: {
      type: Number,
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

module.exports = mongoose.model("Students", studentSchema);
