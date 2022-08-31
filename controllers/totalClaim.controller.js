const totalClaimServices = require("../services/totalClaim.services");

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

module.exports = {
	totalClaim,
};
