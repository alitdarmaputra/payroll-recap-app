require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const errorHandler = require("./helpers/errorHandler.helper");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./routes/index.routes");

app.use("/api/v1", indexRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
