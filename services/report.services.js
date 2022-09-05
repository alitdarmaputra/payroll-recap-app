const { createTransporter, renderEmail } = require("../helpers/mailSender.helper");
const { user_employee } = require("../models");
const nodemailer = require("nodemailer");
const path = require("path");

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
