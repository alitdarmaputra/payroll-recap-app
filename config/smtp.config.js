require('dotenv').config();

const {
	SMTP_DEV_HOST,
	SMTP_DEV_PORT,
	SMTP_DEV_AUTH_USER,
	SMTP_DEV_AUTH_PASS
} = process.env;

module.exports = {
	development: {
		host: SMTP_DEV_HOST,
		port: SMTP_DEV_PORT,
		user: SMTP_DEV_AUTH_USER,
		pass: SMTP_DEV_AUTH_PASS
	},

	test: {
		host: process.env.SMTP_TEST_HOST,
		port: process.env.SMTP_TEST_PORT,
		user: process.env.SMTP_TEST_AUTH_USER,
		pass: process.env.SMTP_TEST_AUTH_PASS
	},

	production: {
		host: process.env.SMTP_TEST_HOST,
		port: process.env.SMTP_TEST_PORT,
		user: process.env.SMTP_TEST_AUTH_USER,
		pass: process.env.SMTP_TEST_AUTH_PASS
	},
};
