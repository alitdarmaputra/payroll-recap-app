require("dotenv").config();
const cors = require('cors');
const corsOption = require('./config/cors.config');
const express = require("express");
const logger = require("morgan");
const errorHandler = require("./helpers/errorHandler.helper");

// Payroll Email Scheduler
const cron = require("node-cron");
const sendReports = require("./services/report.services");

cron.schedule("* 8 25 * *", async() => {
	// Send email on 29th at 8 am every months
	await sendReports();
});

const app = express();

const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./routes/index.routes");

app.use("/api/v1", indexRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
