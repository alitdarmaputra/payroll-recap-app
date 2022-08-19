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

module.exports = {
  createNewEmployee,
};
