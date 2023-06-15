require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const monogDb = require("./src/middleware/dbConnection");
const { logger } = require("./src/middleware/logEvents");
const routes = require("./src/routes");
const errorHandler = require("./src/middleware/errorHandler");
const { sendResponse } = require("./src/utils/common");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(monogDb.connectToDatabase);
app.use(logger);

app.get("/", (req, res) => res.send(`Server listing on port ${PORT}`));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log(err);
    sendResponse(res, 400, "Failed", {
      message: err.message,
    });
  } else if (err) {
    console.log(err);
    sendResponse(res, 400, "Failed", {
      message: err.message,
    });
  } else {
    next();
  }
});

app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(`Server running on ${process.env.BACKEND_URL}`)
);
