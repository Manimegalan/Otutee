const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  code: {
    type: Number,
  },
  expired: {
    type: Boolean,
  },
});

const instituteSchema = mongoose.Schema(
  {
    Role: {
      type: Number,
      default: 2,
    },
    ProfileImage: {
      type: String,
    },
    IDProof: {
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
    InstituteWebsite: {
      type: String,
    },
    InstituteAddress: {
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
    otp: [otpSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institutes", instituteSchema);
