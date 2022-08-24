const userEmployee = require("../services/userEmployee.services");

const createNewEmployee = async (req, res, next) => {
  try {
    const newEmployee = await userEmployee.createEmployee(req.body);

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Success created employee",
      data: newEmployee,
    });
  } catch (err) {
    return next(err);
  }
};

const editedEmployee = async (req, res, next) => {
  try {
    const editedEmployee = await userEmployee.editEmployee(
      req.body,
      req.params.id
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Success edited employee",
      data: editedEmployee,
    });
  } catch (err) {
    return next(err);
  }
};

const listEmployee = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, ...queries } = req.query;

    const showEmployee = await userEmployee.listEmployee(queries, {
      page,
      perPage,
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Success get list employee",
      data: showEmployee,
    });
  } catch (err) {
    return next(err);
  }
};

const showEmployee = async (req, res, next) => {
  try {
    const showEmployee = await userEmployee.showEmployee(req.params.id);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Success get employee",
      data: showEmployee,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const deleteEmployee = await userEmployee.deleteEmployee(req.params.id);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Success delete employee",
      data: deleteEmployee,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createNewEmployee,
  editedEmployee,
  listEmployee,
  showEmployee,
  deleteEmployee,
};
