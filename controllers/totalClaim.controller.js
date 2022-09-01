const totalClaimServices = require('../services/totalClaim.services');

const totalClaim = async (req, res, next) => {
	try {
		const totalNominal = await totalClaimServices.totalClaimNominal(req.body);

		return res.status(200).json({
			statusCode: 200,
			success: true,
			message: 'Success get total nominal',
			data: totalNominal,
		});
	} catch (err) {
		return next(err);
	}
};

const showRecap = async (req, res, next) => {
	try {
		const { period_start = 1, period_end = 12, ...queries } = req.query;

		const recap = await totalClaimServices.recapClaim(queries, {
			period_start,
			period_end,
		});

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: 'Success get recap data',
			data: recap,
		});
	} catch (err) {
		next(err);
	}
};

const downloadRecap = async (req, res, next) => {
	try {
		const { period_start = 1, period_end = 12, ...queries } = req.query;

		const recap = await totalClaimServices.recapClaim(queries, {
			period_start,
			period_end,
		});

		// convert recap to excel then download
		const recapExcel = await totalClaimServices.convertToExcel(recap);
		
		res.download(recapExcel)
	} catch (err) {
		next(err);
	}
};

module.exports = {
	totalClaim,
	showRecap,
	downloadRecap,
};
