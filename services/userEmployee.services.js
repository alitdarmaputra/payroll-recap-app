const Sequelize = require("sequelize");
const { user_employee } = require("../models");
const { Op } = Sequelize;

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

const listEmployee = async (queries) => {
  const condition = {};

  Object.keys(queries).forEach((query) => {
    condition[query] = { [Op.like]: `%${queries[query]}%` };
  });

  const listed = await user_employee.findAndCountAll({
    where: condition,
    order: [["full_name", "ASC"]],
  });

  const result = {
    list: listed.rows,
    total: listed.count,
  };

  return result;
};

module.exports = {
  createEmployee,
  editEmployee,
  listEmployee,
};
