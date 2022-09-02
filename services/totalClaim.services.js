const { recap_data, user_employee } = require('../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const XLXS = require('xlsx');
const path = require('path');
const fs = require('fs');

const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

const totalClaimNominal = async ({
	employee_id,
	period_start,
	period_end,
	period_year,
}) => {
	const employee = await user_employee.findByPk(employee_id);
	if (!employee) throw new NotFoundError('Employee not found');

	if (period_start > period_end)
		throw new ValidationError('Invalid input on period');

	const data = await recap_data.findOne({
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
			claim_type: {
				[Op.or]: ['HEALTH', 'WELLNESS'],
			},
		},
		group: ['employee_id'],
	});

	const result = {
		employee_id: data.employee_id,
		total_claim: parseInt(data.dataValues.total_claim),
		salary: parseFloat(employee.salary),
		remaining_claim_limit:
			parseFloat(employee.salary) - parseFloat(data.dataValues.total_claim),
		period_start: period_start,
		period_end: period_end,
		period_year: period_year,
	};

	return result;
};

const recapClaim = async (queries, { period_start, period_end }) => {
	const condition = {};
	Object.keys(queries).forEach((query) => {
		condition[query] = { [Op.like]: `%${queries[query]}%` };
	});

	if (period_start > period_end)
		throw new ValidationError('Invalid input on period');

	if (!queries.period_year)
		throw new ValidationError('Please provide period_year');

	const recap = await recap_data.findAll({
		attributes: [
			'employee_id',
			'period_month',
			'period_year',
			[sequelize.fn('sum', sequelize.col('nominal')), 'reimbursement'],
		],
		group: ['employee_id', 'period_month', 'period_year'],
		where: {
			...condition,
			period_month: {
				[Op.between]: [period_start, period_end],
			},
			claim_type: {
				[Op.or]: ['HEALTH', 'WELLNESS'],
			},
		},
	});

	const employee = await user_employee.findAll();

	const dataEmployee = employee.map((item) => {
		return {
			employee_id: item.employee_id,
			full_name: item.full_name,
			salary: item.salary,
			constant_salary: item.salary,
		};
	});

	const populate = recap.map(async ({ dataValues: data }) => {
		// const employee = await user_employee.findByPk(data.employee_id);
		const indexEmployee = employee.findIndex(
			(emp) => emp.id === data.employee_id
		);

		dataEmployee[indexEmployee].salary =
			dataEmployee[indexEmployee].salary - data.reimbursement;
		return {
			employee_id: data.employee_id,
			employee_name: dataEmployee[indexEmployee].full_name,
			salary: parseFloat(dataEmployee[indexEmployee].constant_salary),
			reimbursement: parseFloat(data.reimbursement),
			recap_date: new Date(),
			// remaining_claim_limit: salary_remaining - data.reimbursement,
			remaining_claim_limit: dataEmployee[indexEmployee].salary,
			period_month: data.period_month,
			period_year: data.period_year,
			total_salary:
				parseFloat(dataEmployee[indexEmployee].constant_salary) +
				parseFloat(data.reimbursement),
		};
	});

	const data = await Promise.all(populate);

	return data;
};

const convertToExcel = async (data) => {
	const fileName = `recap-${Date.now()}.xlsx`;

	// if directory not exist, create it
	if (!fs.existsSync('public')) {
		fs.mkdirSync('public');
	}

	const filePath = path.join(__dirname, `../public/${fileName}`);

	const worksheet = XLXS.utils.json_to_sheet(data);
	const workbook = XLXS.utils.book_new();

	XLXS.utils.book_append_sheet(workbook, worksheet, 'Recap Data');

	const downloaded = XLXS.writeFile(workbook, filePath, {
		type: 'buffer',
	});
	// set download path

	return filePath;
};

module.exports = {
	totalClaimNominal,
	recapClaim,
	convertToExcel,
};
