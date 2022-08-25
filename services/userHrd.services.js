const Sequelize = require("sequelize");
const { user_hrd } = require("../models");
const { Op } = Sequelize;
const bcrypt = require("bcrypt");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

const addHrd = async({ username, full_name, email, password }) => {
	if(typeof password == "string") {
		if(password.length < 6)
			throw new ValidationError("password value min 6");

		password = await bcrypt.hash(password, 12); 
	}
	
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
		errors.forEach(error => {
			if (error.type == "unique violation") {
				throw new ConflictError(
					`This ${error.path} already used, try with another ${error.path}`
				);
			} else if (error.type == "notNull Violation") {
				throw new ValidationError(`Plese provide ${error.path}`);
			} else if (error.path == "email") {
				throw new ValidationError("Email must be valid");
			} else if (error.path == "full_name") {
				throw new ValidationError("Full name value min 5");
			} else if (error.path == "username") {
				throw new ValidationError("username value min 5");
			} 
		});
	}
}

const deleteHrd = async(id) => {
    const payload = {
        status: "DELETED", 
        updated_date: new Date()
    }

	const hrd = await user_hrd.findByPk(id);

	if (!hrd) 
	  throw new NotFoundError("Hrd not found");

	await user_hrd.update(payload, {
		where: { id }
	});
}

const editHrd = async(data_hrd) => {
	const hrd = await user_hrd.findByPk(data_hrd.id);

	if (!hrd)
		throw new NotFoundError("Hrd not found");

	try {
        data_hrd.updated_date = new Date();
		await user_hrd.update(data_hrd, {
			where: { id: data_hrd.id }
		});
	} catch(err) {
		console.log(err);
		const errors = err.errors;
		errors.forEach((error) => {
			if (error.type == "unique violation") {
				throw new ConflictError(
					`This ${error.path} already used, try with another ${error.path}`
				);
			} else if (error.type == "notNull Violation") {
				throw new ValidationError(`Plese provide ${error.path}`);
			} else if (error.path == "email") {
				throw new ValidationError("Email must be valid");
			} else if (error.path == "full_name") {
				throw new ValidationError("Full name value min 5");
			} else if (error.path == "username") {
				throw new ValidationError("username value min 5");
			}
		});	
	}
}

const getHrd = async(id) => {
	const detail_hrd = await user_hrd.findOne({
		where: { id }
	});

	if(!detail_hrd)
		throw new NotFoundError("Hrd not found");

	return detail_hrd;
}

const listHrd = async(queries) => {
	const default_page = 10;
	const { page = 1, size = default_page, full_name, ...conditions } = queries;
	
	if (full_name)
		conditions.full_name = { [Op.like]: `%${full_name}%` };
	
	const hrd_list = await user_hrd.findAndCountAll({
		where: conditions,
		limit: parseInt(size, 10),
		offset:parseInt((page-1) * default_page, 10)
	});

	return { 
		totalData: hrd_list.count,
		totalPages: Math.ceil(hrd_list.count/default_page), 
		content: hrd_list.rows,
		currentPage: isNaN(page)? 1 : page,
	};
}

module.exports = { addHrd, deleteHrd, editHrd, getHrd, listHrd };
