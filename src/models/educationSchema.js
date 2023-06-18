const mongoose = require("mongoose");

const educationSchema = mongoose.Schema(
  {
    School: [
      {
        Classes: [
          {
            Name: {
              type: String,
            },
            Syllabuses: [
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
                          {
                            Name: {
                              type: String,
                            },
                            Author: {
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "Students",
                              required: true,
                            },
                            type: { type: String, enum: ["public", "friends"] },
                            Content: {
                              text: {
                                type: String,
                              },
                              url: {
                                type: String,
                              },
                            },
                            Likes: [
                              {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Students",
                              },
                            ],
                            Comments: [
                              {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Comment",
                              },
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
        ],
      },
    ],
    Engineering: [
      {
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
                        Content: {
                          text: {
                            type: String,
                          },
                          url: {
                            type: String,
                          },
                        },
                      },
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
  { timestamps: true }
);

module.exports = mongoose.model("Educations", educationSchema);
