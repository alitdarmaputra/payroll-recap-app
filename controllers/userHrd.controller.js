const HrdServices = require("../services/userHrd.services");

const addHrd = async(req, res, next) => {
	try {
		const added_hrd = await HrdServices.addHrd(req.body);
		res.status(201).json({ 
			statusCode: 201,
			success: true,
			message: "Success created hrd",
			data: added_hrd
		});
	} catch(err) {
		return next(err);	
	}
}

const deleteHrd = async(req, res, next) => {
	try {
		await HrdServices.deleteHrd(req.params.id);
		res.status(200).json({ 
			statusCode: 200,
			success: true,
			message: "Success delete hrd",
			data: null
		});
	} catch(err) {
		return next(err);	
	}
}

const editHrd = async(req, res, next) => {
	try {
		await HrdServices.editHrd(req.body);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Success edit hrd",
			data: null
		});
	} catch(err) {
		return next(err);
	}
}

const getHrd = async(req, res, next) => {
	try {
		const user_hrd = await HrdServices.getHrd(req.params.id);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Success get hrd",
			data: user_hrd
		});
	} catch(err) {
		return next(err);
	}
}
	
const listHrd = async(req, res, next) => {
	try {
		const users_hrd = await HrdServices.listHrd(req.query);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Sucess list hrd",
			data: users_hrd
		});
	} catch(err) {
		return next(err);
	}
} 

module.exports = { addHrd, deleteHrd, editHrd, getHrd, listHrd };
