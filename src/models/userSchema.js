const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    Role: {
      type: String,
      enum: ["student", "teacher", "institute"],
      required: true,
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
    Organization: {
      type: String,
    },
    Institute: {
      type: String,
    },
    InstituteName: {
      type: String,
    },
    AdministratorName: {
      type: String,
    },
    MobileNumber: {
      type: String,
      unique: true,
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
      unique: true,
    },
    InstituteWebsite: {
      type: String,
    },
    InstituteAddress: {
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
    EducationType: {
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
    otp: [
      {
        code: {
          type: Number,
        },
        expired: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
