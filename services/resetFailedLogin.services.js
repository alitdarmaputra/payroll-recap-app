const { parentPort } = require("worker_threads");
const { user_hrd  } = require("../models");

parentPort.addListener("message", email => {
	setTimeout(async () => {
		await user_hrd.update(
		{ failed_login: 0 },
		{ where: { email } })
	}, 1000 * 60)	
	parentPort.close();
});
