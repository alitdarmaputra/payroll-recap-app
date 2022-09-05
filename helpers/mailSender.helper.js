const nodemailer = require("nodemailer");

const env = process.env.NODE_ENV || "development";
const config = require(`${__dirname}/../config/smtp.config.js`)[env];

const createTransporter = async() => {
	const transporter = nodemailer.createTransport({
		host: config.host,
		port: config.port,
		auth: {
			user: config.user,
			pass: config.pass
		}
	});

	return transporter;
}

const renderEmail = ({ employee_name}) => {
	return `
	<h1>Monthly Payroll Report</h1>
	<hr>
	<h2><b>Hello, ${ employee_name }</b></h2>
	<br>
	<p>Here is your payroll report on ${ new Date().toLocaleDateString() }</p>
	`
}

module.exports = { createTransporter, renderEmail }; 
