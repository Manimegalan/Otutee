const mongoose = require("mongoose");

const schemaCategories = {
  School: {
    Name: {
      type: String,
    },
    Classes: [
      {
        Name: {
          type: String,
        },
        Subjects: [
          {
            Name: {
              type: String,
            },
            Chapters: [
              {
                Name: {
                  type: String,
                },
                Posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
              },
            ],
          },
        ],
      },
    ],
  },
  College: {
    Name: {
      type: String,
    },
    Departments: [
      {
        Name: {
          type: String,
        },
        Semesters: [
          {
            Name: {
              type: String,
            },
            Subjects: [
              {
                Name: {
                  type: String,
                },
                Chapters: [
                  {
                    Name: {
                      type: String,
                    },
                    Posts: [
                      { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

const schoolSchema = mongoose.Schema(schemaCategories["School"], {
  timestamps: true,
});

const collegeSchema = mongoose.Schema(schemaCategories["College"], {
  timestamps: true,
});

module.exports = {
  schoolModel: mongoose.model("School", schoolSchema, "educations"),
  collegeModel: mongoose.model("College", collegeSchema, "educations"),
};
