const { parentPort } = require("worker_threads");
const { createTransporter, renderEmail } = require("../helpers/mailSender.helper");
const path = require("path");
const nodemailer = require("nodemailer");

parentPort.addListener("message",async user_employee => {
	try {
		const transporter = await createTransporter();
		let info = await transporter.sendMail({
			from: '"Payroll App" <foo@example.com>', 
			subject: "Monthly Payroll Report",
			to: user_employee.email,
			html: renderEmail(user_employee),
			attachments: [
				{
					filename: `payrollReport-${user_employee.employee_id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`,
					path: path.resolve(__dirname, "../public", `payrollReport-${user_employee.employee_id}-${new Date().getMonth()+1}-${new Date().getFullYear()}.pdf`)
				}
			]
		});

		console.log(info);
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
		
		transporter.close();

		parentPort.postMessage(`Done send email for user ${user_employee.employee_id}`);
	} catch(err) {
		parentPort.postMessage(err);
	}
});
