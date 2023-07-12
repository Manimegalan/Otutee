const mongoose = require("mongoose");

const toppersSchema = mongoose.Schema(
  {
    EducationType: {
      type: String,
      enum: ["school", "college"],
    },
    Name: {
      type: String,
    },
    SchoolOrInstituteName: {
      type: String,
    },
    ClassOrCourse: [
      {
        type: String,
      },
    ],
    YearOfPassing: {
      type: String,
    },
    PercentageOrCGPA: {
      type: String,
    },
    Description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Toppers", toppersSchema);
