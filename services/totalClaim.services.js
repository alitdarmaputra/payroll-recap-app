const { recap_data, user_employee } = require('../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const XLXS = require('xlsx');
const path = require('path');
const fs = require('fs');

const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

function toStrMonth(intMonth) {
	const Months = {
		1: 'JANUARY',
		2: 'FEBRUARY',
		3: 'MARCH',
		4: 'APRIL',
		5: 'MAY',
		6: 'JUNE',
		7: 'JULY',
		8: 'AUGUST',
		9: 'SEPTEMBER',
		10: 'OCTOBER',
		11: 'NOVEMBER',
		12: 'DECEMBER',
	};
	return Months[intMonth];
}

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

	if(!queries.period_year) queries.period_year = new Date().getFullYear();

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
			'claim_type',
			[sequelize.fn('sum', sequelize.col('nominal')), 'total_claim'],
		],
		group: ['employee_id', 'period_month', 'period_year', 'claim_type'],
		where: {
			...condition,
			period_month: {
				[Op.between]: [period_start, period_end],
			},
		},
		order: [
			['employee_id', 'ASC'],
			['period_year', 'ASC'],
			['period_month', 'ASC'],
		],
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

	const findedUser = [];

	recap.forEach((item) => {
		if (!findedUser.includes(item.employee_id)) {
			findedUser.push(item.employee_id);
		}
	});

	const populate = [];

	await Promise.all(
		recap.map(async ({ dataValues: data }) => {
			const indexEmployee = employee.findIndex(
				(emp) => emp.id === data.employee_id
			);

			const isUserExist = populate.find(
				(item) =>
					item?.employee_id === data.employee_id &&
					item?.period_month === toStrMonth(data.period_month) &&
					item?.period_year === data.period_year
			);

			if (!isUserExist) {
				populate.push({
					employee_id: data.employee_id,
					period_month: toStrMonth(data.period_month),
					period_year: data.period_year,
				});
			}

			const userIndex = populate.findIndex(
				(item) =>
					item?.employee_id === data.employee_id &&
					item?.period_month === toStrMonth(data.period_month) &&
					item?.period_year === data.period_year
			);

			const currentUserPopulate = populate[userIndex];

			let total_reimbursement = currentUserPopulate?.reimbursement || 0;
			let tax = currentUserPopulate?.tax || 0;
			let deduction = currentUserPopulate?.deduction || 0;

			if (data.claim_type == 'HEALTH' || data.claim_type == 'WELLNESS') {
				dataEmployee[indexEmployee].salary =
					dataEmployee[indexEmployee].salary - data.total_claim;
				total_reimbursement =
					parseFloat(total_reimbursement) + parseFloat(data.total_claim);
			}

			if (data.claim_type == 'TAX') {
				tax = parseFloat(tax) + parseFloat(data.total_claim);
			}

			if (data.claim_type == 'DEDUCTION') {
				deduction = parseFloat(deduction) + parseFloat(data.total_claim);
			}

			const result = {
				employee_id: data.employee_id,
				employee_name: dataEmployee[indexEmployee].full_name,
				period_month: toStrMonth(data.period_month),
				period_year: data.period_year,
				salary: parseFloat(dataEmployee[indexEmployee].constant_salary),
				// claim_type: data.claim_type,
				reimbursement: total_reimbursement,
				tax,
				deduction,
				remaining_claim_limit: dataEmployee[indexEmployee].salary,
				total_salary:
					parseFloat(dataEmployee[indexEmployee].constant_salary) +
					parseFloat(total_reimbursement) -
					parseFloat(tax) -
					parseFloat(deduction),
				recap_date: new Date(),
			};

			populate[userIndex] = result;
		})
	);

	return populate;
};

const convertToExcel = async (data) => {
	const today = new Date();
	const month = toStrMonth(today.getMonth() + 1);
	const date = `${today.getDate()}-${month}-${today.getFullYear()}`;
	const fileName = `recap-${date}.xlsx`;

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
	toStrMonth
};
