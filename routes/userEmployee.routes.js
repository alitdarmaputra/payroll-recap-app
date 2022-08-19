const express = require("express");
const employeeController = require("../controllers/userEmployee.controller");

const router = express.Router();

router.post("/", employeeController.createNewEmployee);

router.put("/:id", employeeController.editedEmployee);

router.get("/", employeeController.listEmployee);

module.exports = router;
