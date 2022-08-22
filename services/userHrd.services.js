const Sequelize = require("sequelize");
const { user_hrd } = require("../models");
const { Op } = Sequelize;

const addHrd = async({ username, full_name, email, password }) => {
    const payload = {
        username,
        full_name,
        email,
        password,
        created_date: new Date(),
        updated_date: new Date(),
    }
	try {
		const new_hrd = await user_hrd.create(payload);	
		return new_hrd;
	} catch(err) {
		console.log(err);
		const errors = err.errors;
		let validation_error = errors.map(error => {
			if(error.type == "unique violation") {
				return `This ${error.path} already used, try with another ${error.path}`; 
			} else if(error.type == "notNull Violation") {
				return `Plese provide ${error.path}`;	
			} else {
				return "Error while adding user_hrd"
			}
		});
		throw Error(validation_error);
	}
}

const deleteHrd = async(id) => {
    const payload = {
        status: "DELETED", 
        updated_date: new Date()
    }
	try {
		await user_hrd.update(payload, {
			where: { id }
		});
		return;
	} catch(err) {
		console.log(err);
		throw Error("Error while deleting user_hrd");
	}
}

const editHrd = async(data_hrd, id) => {
	try {
        data_hrd.updated_date = new Date();
		await user_hrd.update(data_hrd, {
			where: { id }
		});
		return;
	} catch(err) {
		console.log(err);
		throw Error("Error while editing user_hrd");
	}
}

const getHrd = async(id) => {
	try {
		const detail_hrd = await user_hrd.findAll({
			where: { id }
		});
		return detail_hrd;
	} catch(err) {
		console.log(err);
		throw Error("Error while getting user_hrd");
	}
}

const listHrd = async(queries) => {
	const { limit, offset, full_name, ...conditions } = queries;
	
	if (full_name)
		conditions.full_name = { [Op.like]: `%${full_name}%` };

	try {
		const hrd_list = await user_hrd.findAll({
			where: conditions,
			limit: isNaN(limit)? undefined : parseInt(limit, 10),
			offset: isNaN(offset)? undefined : parseInt(offset, 10)
		});
		return { results: hrd_list, totalResults: hrd_list.length };
	} catch(err) {
		console.log(err);
		throw Error("Error while listing user_hrd");
	}
}

module.exports = { addHrd, deleteHrd, editHrd, getHrd, listHrd };