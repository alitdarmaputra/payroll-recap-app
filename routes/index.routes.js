const express = require("express");
const employeeRoutes = require("./userEmployee.routes");
const hrdRoutes = require("./userHrd.routes");
const authRoutes = require("./userAuth.routes");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.use("/employee", employeeRoutes);
router.use("/hrd", hrdRoutes);
router.use("/auth", authRoutes);

module.exports = router;
