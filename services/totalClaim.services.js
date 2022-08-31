const { recap_data, user_employee } = require('../models');
const sequelize = require('sequelize');
const { Op } = sequelize;

const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

module.exports = {
	totalClaimNominal: async ({
		employee_id,
		period_start,
		period_end,
		period_year,
	}) => {
		const employee = await user_employee.findByPk(employee_id);
		if (!employee) throw new NotFoundError('Employee not found');

		if (period_start > period_end)
			throw new ValidationError('Invalid input on period');

		return await recap_data.findAll({
			attributes: [
				'employee_id',
				[sequelize.fn('sum', sequelize.col('nominal')), 'total_claim'],
			],
			where: {
				employee_id,
				period_month: {
					[Op.between]: [period_start, period_end],
				},
				period_year,
			},
			group: ['employee_id'],
		});
	},
};
