const mongoose = require("mongoose");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  dbName: process.env.DB_NAME,
};
let dbConnection = null;
exports.connectToDatabase = async (req, res, next) => {
  if (dbConnection) {
    console.log(String.fromCodePoint(0x1f5c2), "DB Connection Successful");
    next();
  } else {
    console.log(
      String.fromCodePoint(0x1f5c2),
      "Trying to Connect DB \n",
      process.env.DB_STRING
    );
    mongoose.connect(process.env.DB_STRING, options).then(
      (db) => {
        console.log(String.fromCodePoint(0x1f5c2), "DB Connection Successful");
        dbConnection = db.connections[0].readyState;
        mongooseConnection = db;
        next();
      },
      (err) => {
        console.log(
          String.fromCodePoint(0x1f5c2),
          "Error Connecting with DB \n",
          process.env.DB_STRING
        );
        console.log(err);
        return res.send({
          statusCode: 409,
          success: false,
          message: "DB connection failure",
        });
      }
    );
  }
};
