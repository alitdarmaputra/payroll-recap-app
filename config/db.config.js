require('dotenv').config();

const {
	DB_DEV_USERNAME,
	DB_DEV_PASSWORD,
	DB_DEV_NAME,
	DB_DEV_HOST,
	DB_DEV_DIALECT,
	DB_DEV_PORT,
} = process.env;

module.exports = {
	development: {
		username: DB_DEV_USERNAME,
		password: DB_DEV_PASSWORD,
		database: DB_DEV_NAME,
		host: DB_DEV_HOST,
		dialect: DB_DEV_DIALECT,
		port: DB_DEV_PORT,
		pool: {
			acquire: 30000,
			idle: 10000,
		},
	},

	test: {
		username: DB_DEV_USERNAME,
		password: DB_DEV_PASSWORD,
		database: DB_DEV_NAME,
		host: DB_DEV_HOST,
		dialect: DB_DEV_DIALECT,
		port: DB_DEV_PORT,
		pool: {
			acquire: 30000,
			idle: 10000,
		},
	},

	production: {
		username: process.env.DB_PROD_USERNAME,
		password: process.env.DB_PROD_PASSWORD,
		database: process.env.DB_PROD_NAME,
		host: process.env.DB_PROD_HOST,
		dialect: process.env.DB_PROD_DIALECT,
		port: process.env.DB_PROD_PORT,
		pool: {
			acquire: 30000,
			idle: 10000,
		},
		logging: false,
	},
};
