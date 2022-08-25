const Sequelize = require("sequelize");
const { user_employee } = require("../models");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");
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

  try {
    const result = await user_employee.create(payload);
    return result;
  } catch (err) {
    const errors = err.errors;
    errors.map((error) => {
      if (error.type == "unique violation") {
        throw new ConflictError(
          `This ${error.path} already used, try with another ${error.path}`
        );
      } else if (error.type == "notNull Violation") {
        throw new ValidationError(`Plese provide ${error.path}`);
      } else if (error.path === "email") {
        throw new ValidationError("Email must be valid");
      } else if (error.path === "full_name") {
        throw new ValidationError("Full name value min 5");
      }
    });
  }
};

const editEmployee = async ({ full_name, email, salary, id }) => {
  const payload = {
    id,
    full_name,
    email,
    updated_date: new Date(),
    salary: parseInt(salary, 10),
  };

  const employee = await user_employee.findByPk(id);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  try {
    await user_employee.update(payload, { where: { id } });
    return payload;
  } catch (err) {
    const errors = err.errors;
    errors.map((error) => {
      if (error.type == "unique violation") {
        throw new ValidationError(
          `This ${error.path} already used, try with another ${error.path}`
        );
      } else if (error.type == "notNull Violation") {
        throw new ValidationError(`Plese provide ${error.path}`);
      } else if (error.path === "email") {
        throw new ValidationError("Email must be valid");
      } else if (error.path === "full_name") {
        throw new ValidationError("Full name value min 5");
      }
    });
  }
};

const listEmployee = async (queries, { page, size }) => {
  size = parseInt(size, 10);
  page = parseInt(page, 10);
  const condition = {};

  Object.keys(queries).forEach((query) => {
    condition[query] = { [Op.like]: `%${queries[query]}%` };
  });

  const listed = await user_employee.findAndCountAll({
    where: condition,
    order: [["full_name", "ASC"]],
    distinct: true,
    limit: size,
    offset: size * (page - 1),
  });

  const result = {
    totalData: listed.count,
    totalPages: Math.ceil(listed.count / size),
    content: listed.rows,
    currentPage: page,
  };

  return result;
};

const showEmployee = async (id) => {
  const result = await user_employee.findOne({
    where: { id },
  });

  if (!result) {
    throw new NotFoundError("Employee not found");
  }

  return result;
};

const deleteEmployee = async (id) => {
  const employee = await user_employee.findByPk(id);
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  const result = await user_employee.update(
    {
      status: "DELETED",
      updated_date: new Date(),
    },
    {
      where: { id },
    }
  );

  return result;
};

module.exports = {
  createEmployee,
  editEmployee,
  listEmployee,
  showEmployee,
  deleteEmployee,
};
