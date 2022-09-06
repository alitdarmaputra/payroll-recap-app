const sequelize = require('sequelize');
const NotFoundError = require('../errors/NotFoundError');
const { user_employee, user_hrd, verification_token } = require('../models');

const findHrd = async (email) => {
  try {
    const result = await user_hrd.findOne({
      where: { email }
    });

    return result;
  } catch (err) {
    return NotFoundError("HRD not Found");
  }
}

const deleteToken = async (token) => {
  try {
    await verification_token.destroy({
      where: { token }
    });

    return result;

  } catch (err) {
    return Error(err);
  }
}

const addToken = async (token, userid) => {
  let result;

  try {
    result = await verification_token.create({
      token,
      user_id: userid
    });
  } catch (err) {
    throw Error(err);
  }

  return result;
}

const findToken = async (token) => {
  try {
    return await verification_token.findOne({
      where: { token }
    });
  } catch (err) {
    throw Error(err);
  }
}

const updateFailedLogin = async(email, failed_login) => {
	await user_hrd.update(
	{ failed_login },
	{ where: { email } });
}

module.exports = {
  findHrd,
  deleteToken,
  addToken,
  findToken,
  updateFailedLogin,
};
