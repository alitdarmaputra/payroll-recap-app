const express = require("express");
const employeeController = require("../controllers/userEmployee.controller");
const { verifyToken } = require("../middleware/userAuth.middleware");

const router = express.Router();

router.post("/", verifyToken, employeeController.createNewEmployee);

router.put("/", verifyToken, employeeController.editedEmployee);

router.get("/", verifyToken, employeeController.listEmployee);
router.get("/:id", verifyToken, employeeController.showEmployee);

router.delete("/:id", verifyToken, employeeController.deleteEmployee);

module.exports = router;
