const { user_employee } = require("../models");

const createEmployee = async ({ full_name, email, salary }) => {
  const payload = {
    full_name,
    email,
    created_date: new Date(),
    updated_date: new Date(),
    status: "ACTIVE",
    salary: parseInt(salary, 10),
  };

  const result = await user_employee.create(payload);

  return result;
};

const editEmployee = async ({ full_name, email, salary }, id) => {
  const payload = {
    full_name,
    email,
    updated_date: new Date(),
    salary: parseInt(salary, 10),
  };

  const result = await user_employee.update(payload, { where: { id } });
  return result;
};

module.exports = {
  createEmployee,
  editEmployee,
};
