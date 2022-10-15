const recapServices = require("../services/recap.sevices");

const addRecap = async (req, res, next) => {
	try {
		const added_recap = await recapServices.addRecap(req.body, req.user);

		res.status(201).json({ 
			statusCode: 201,
			success: true,
			message: "Success created recap",
			data: added_recap 
		});
	} catch(err) {
		next(err);
	}
}

const addRecapFile = async (req, res, next) => {
	try {
		const new_recaps = await recapServices.addRecapFile(req.file.path, req.user); 	
		res.status(201).json({ 
			statusCode: 201,
			success: true,
			message: "Success created recap",
			data: new_recaps 
		});
	} catch(err) {
		next(err);
	}
}

const listRecap = async(req, res, next) => {
	try {
		const recaps = await recapServices.listRecap(req.query);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Sucess list recap",
			data: recaps 
		});
	} catch(err) {
		return next(err);
	}
} 
module.exports = { addRecap, addRecapFile, listRecap };
