const { createTransporter, renderEmail } = require("../helpers/mailSender.helper");
const { user_employee, recap_data } = require("../models");
const sequelize = require('sequelize')
const nodemailer = require("nodemailer");
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const sendEmail = async (transporter, user_employee) => {
	let info = await transporter.sendMail({
		from: '"Payroll App" <no-reply@payrollapp.com>', 
		to: user_employee.email,
		subject: "Monthly Payroll Report",
		html: renderEmail(user_employee),
		attachments: [
			{
				filename: `payrollReport-${user_employee.id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`,
				path: path.resolve(__dirname, "../public", `payrollReport-${user_employee.id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`)
			}
		]
	});

	return info;
}

const sendReports = async () => {
	const transporter = await createTransporter();	
	
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
				period_month: data.period_month,
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

	// generate pdf using pdfkit
	const pdfData = []
	populate.forEach((item) => {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(`public/payrollReport-${item.employee_id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`));
        doc
            .fontSize(25)
            .text("Payroll Report", 100, 80)
            .fontSize(15)
            .text(`Employee ID: ${item.employee_id}`, 100, 150)
            .text(`Employee Name: ${item.employee_name}`, 100, 170)
            .text(`Period: ${item.period_month} ${item.period_year}`, 100, 190)
            .text(`Salary: Rp. ${item.salary}`, 100, 210)
            .text(`Reimbursement: Rp. ${item.reimbursement}`, 100, 230)
            .text(`Tax: Rp. ${item.tax}`, 100, 250)
            .text(`Deduction: Rp. ${item.deduction}`, 100, 270)
            .text(`Remaining Claim Limit: Rp. ${item.remaining_claim_limit}`, 100, 290)
            .text(`Total Salary: Rp. ${item.total_salary}`, 100, 310)
            .text(`Recap Date: ${item.recap_date}`, 100, 330)
            .end();
    })

	
	// Send email to all user
	user_employees.forEach(async employee => {
		try {
			let info = await sendEmail(transporter, employee);
			console.log(info);
			console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
		} catch(err) {
			console.log(err);
		}
	});
}

module.exports = sendReports;
