const express = require("express");
const employeeRoutes = require("./userEmployee.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.use("/employee", employeeRoutes);

module.exports = router;
