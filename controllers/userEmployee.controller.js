const userEmployee = require("../services/userEmployee.services");

const createNewEmployee = async (req, res) => {
  try {
    const newEmployee = await userEmployee.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: "Success created employee",
      data: newEmployee,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

const editedEmployee = async (req, res) => {
  try {
    const editedEmployee = await userEmployee.editEmployee(
      req.body,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Success edited employee",
      data: editedEmployee,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};

module.exports = {
  createNewEmployee,
  editedEmployee,
};
