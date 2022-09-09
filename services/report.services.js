const { user_employee, recap_data } = require("../models");
const { toStrMonth } = require("./totalClaim.services");
const sequelize = require('sequelize')
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const { Op } = require("sequelize");

const sendReports = async () => {
	// Get All User
	const user_employees = await user_employee.findAll({
	where: {
			status: "ACTIVE"
		}
	});
	
	// Generate pdf for all employee
	const today = new Date();
	const currentMonth = today.getMonth()+1;
	const currentYear = today.getFullYear();
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
			period_month: currentMonth,
			period_year: currentYear
		}
	});

	const dataEmployee = user_employees.map((item) => {
		return {
			employee_id: item.id,
			full_name: item.full_name,
			email: item.email,
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
			const indexEmployee = user_employees.findIndex(
				(emp) => emp.id === data.employee_id
			);

			const isUserExist = populate.find(
				(item) =>
					item?.employee_id === data.employee_id &&
					item?.period_month === data.period_month &&
					item?.period_year === data.period_year
			);

			if (!isUserExist) {
				populate.push({
					employee_id: data.employee_id,
					period_month: data.period_month,
					period_year: data.period_year,
				});
			}

			const userIndex = populate.findIndex(
				(item) =>
					item?.employee_id === data.employee_id &&
					item?.period_month === data.period_month &&
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
				email: dataEmployee[indexEmployee].email,
				period_month: data.period_month,
				period_year: data.period_year,
				salary: parseFloat(dataEmployee[indexEmployee].constant_salary),
				// claim_type: data.claim_type,
				reimbursement: total_reimbursement,
				tax,
				deduction,
				remaining_claim_limit: dataEmployee[indexEmployee].salary,
				total_accepted:
					parseFloat(dataEmployee[indexEmployee].constant_salary) +
					parseFloat(total_reimbursement) -
					parseFloat(tax) -
					parseFloat(deduction),
				recap_date: new Date(),
			};

			populate[userIndex] = result;
		})
	);

	// generate pdf using pdfkit
	const { Worker } = require("worker_threads");
	const send_email_worker = new Worker("./services/sendEmail.services.js");

	populate.forEach((item) => {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(`public/payrollReport-${item.employee_id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`));

		;(async function createTable(){
			// table
			const header ={
			  title: `Payroll Report per ${toStrMonth(currentMonth)}/${currentYear}`,
			  subtitle: `Employee: ${item.employee_id} - ${item.employee_name}         Recap Date: ${item.recap_date}`,
			  headers:[' ']
			}
			
			await doc.table(header, { hideHeader: true });
			doc.moveDown();

			// Create salary table
			const table_salary = { 
			  subtitle: `Total Salary`, 
				headers: [
					{ label:"Type", property: 'type', renderer: null },
					{ label:"Nominal", property: 'nominal', renderer: null },
				],
				datas: [
					{ type: "Salary", nominal: `${item.salary}` },
					{ type: "Reimbursement", nominal: `${item.reimbursement}` },
					{ type: "total salary", nominal: `${item.salary + item.reimbursement}` }
				],
			};

			await doc.table(table_salary);
			doc.moveDown();

			// Create deduction table
			const user_deduction = await recap_data.findAll({
				where: {
					employee_id: item.employee_id,
					period_month: currentMonth,
					period_year: currentYear,
					claim_type: {
						[Op.or]: ['TAX', 'DEDUCTION']
					}
				}
			});

			const deduction_datas = user_deduction?.map(data => {
				return {
					type: data.dataValues.claim_type,
					desc: data.dataValues.claim_description,
					nominal: data.dataValues.nominal
				}
			}) || [];

			deduction_datas.push({ type: "Total deduction", desc: "", nominal: item.deduction + item.tax });
			
			const table_deduction = { 
			  subtitle: `Total Deduction`, 
				headers: [
					{ label:"Type", property: 'type', renderer: null },
					{ label:"Desc", property: 'desc', renderer: null },
					{ label:"Nominal", property: 'nominal', renderer: null },
				],
				datas: deduction_datas,
			};	
			
			await doc.table(table_deduction);
			doc.moveDown();
			
			const table_accepted = { 
			  subtitle: `End Total`, 
				headers: [
					{ label:"Type", property: 'type', renderer: null },
					{ label:"Nominal", property: 'nominal', renderer: null },
				],
				datas: [{
					type: "Total Accepted (salary + reimbursement - deduction)",
					nominal: item.total_accepted
				}, {
					type: "Remaining Claim",
					nominal: item.remaining_claim_limit
				}],
			};
		
			await doc.table(table_accepted);
			doc.end();

			send_email_worker.postMessage(item);
		})();
	})
	
	send_email_worker.addListener("message", message => {
		console.log(message);
	});
}

module.exports = sendReports;
