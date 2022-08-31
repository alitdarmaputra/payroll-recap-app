const { user_employee } = require("../models");
const { recap_data } = require("../models");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");
const XLSX = require("xlsx");
const path = require("path");
const sequelize = require("../models/index").sequelize;

function toIntMonth(strMonth) {
	const Months = {
		JANUARY: 1,
		FEBRUARY: 2,
		MARCH: 3,
		APRIL: 4,
		MAY: 5,
		JUNE: 6,
		JULY: 7,
		AUGUST: 8,
		SEPTEMBER: 9,
		OCTOBER: 10,
		NOVEMBER: 11,
		DECEMBER: 12 
	}
	return Months[strMonth.toUpperCase()];
}

const addRecap = async (new_recap, { full_name }, t = null) => {
	let { claim_type, claim_name, claim_description, nominal, period_month, period_year, employee_id } = new_recap;
	
	claim_type = claim_type.toUpperCase();

	// Convert month string to number
	period_month = toIntMonth(period_month); 

	// Check if employee exist
	const employee = await user_employee.findByPk(employee_id);
	
	if(!employee)
		throw new NotFoundError("Employee not found");
	
	// Check is valid claim
	nominal = parseFloat(nominal);

	let totalSalary = parseFloat(employee.salary) + (claim_type == "HEALTH" || claim_type == "WELLNESS"? -nominal : nominal );

	const claimHistories = await recap_data.findAll({
		where: {
			employee_id,
			period_year: parseInt(period_year),
			period_month: period_month
		}, 
		transaction: t
	});
	
	claimHistories.forEach(history => {
		const historyNominal = parseFloat(history.dataValues.nominal);
		totalSalary = totalSalary + ((history.dataValues.claim_type == "HEALTH" || history.dataValues.type == "WELLNESS" ? -historyNominal : historyNominal ));
	});
		
	if(totalSalary < 0) 
		throw new ValidationError("Not enough salary for user_employee with id " + new_recap.employee_id);

	try {
		const payload = {
			created_date: new Date(),
			created_by: full_name, 
			claim_type,
			claim_name,
			claim_description,
			nominal,
			period_month,
			period_year,
			employee_id
		}
		const addedRecap = await recap_data.create(payload, { transaction: t });
		return addedRecap;
	} catch(err) {
		console.log(err);
		throw Error();
	}
}

const addRecapFile = async (file_path, user) => {
	// Read uploaded file
	const file = XLSX.readFile(path.resolve(file_path));
	const recapJSON = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
	
	let all_recap = [];

	const t = await sequelize.transaction();
	try {
		for(let i = 0; i<recapJSON.length; i++) {
			const added_recap = await addRecap(recapJSON[i], user, t);		
			all_recap.push(added_recap);
		}
		await t.commit();
		return all_recap;
	} catch(err) {
		await t.rollback();
		throw err;
	}	
}

module.exports = { addRecap, addRecapFile };
