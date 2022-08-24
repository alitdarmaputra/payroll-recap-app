const HrdServices = require("../services/userHrd.services");
const bcrypt = require("bcrypt");

const addHrd = async(req, res) => {
	const user_hrd = req.body;

	try {
		const added_hrd = await HrdServices.addHrd(user_hrd);

		res.status(201).json({ 
			statusCode: 201,
			success: true,
			message: "Success added hrd",
			data: added_hrd
		});
	} catch(err) {
		res.status(500).json({ 
			statusCode: 500,
			success: false,
			message: err.message,
			data: null
		});
	}
}

const deleteHrd = async(req, res) => {
	try {
		await HrdServices.deleteHrd(req.params.id);
		res.status(200).json({ 
			statusCode: 200,
			success: true,
			message: "Success delete hrd",
			data: null
		});
	} catch(err) {
		res.status(500).json({
			statusCode: 500,
			success: false,
			message: err.message,
			data: null
		});
	}
}

const editHrd = async(req, res) => {
	try {
		await HrdServices.editHrd(req.body);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Success edit hrd",
			data: null
		});
	} catch(err) {
		res.status(500).json({
			statusCode: 500,
			success: false,
			message: err.message,
			data: null
		});
	}
}

const getHrd = async(req, res) => {
	try {
		const user_hrd = await HrdServices.getHrd(req.params.id);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Success get hrd",
			data: user_hrd
		});
	} catch(err) {
		res.status(500).json({
			statusCode: 500,
			success: false,
			message: err.message,
			data: null
		});
	}
}
	
const listHrd = async(req, res) => {
	try {
		const users_hrd = await HrdServices.listHrd(req.query);
		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Sucess list hrd",
			data: users_hrd
		});
	} catch(err) {
		res.status(500).json({
			statusCode: 500,
			success: false,
			message: err.message,
			data: null
		});
	}
} 

module.exports = { addHrd, deleteHrd, editHrd, getHrd, listHrd };
