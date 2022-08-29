const { user_employee } = require("../models");
const { recap_data } = require("../models");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");

const addRecap = async (new_recap, { full_name }) => {
	let { claim_type, claim_name, claim_description, nominal, period_month, period_year, employee_id } = new_recap;

	// Check if employee exist
	const employee = await user_employee.findByPk(employee_id);
	
	if(!employee)
		throw new NotFoundError("Employee not found");
	
	// Check is valid claim
	nominal = parseFloat(nominal);

	let totalSalary = parseFloat(employee.salary) + (claim_type == "TAX" || claim_type == "DEDUCTION"? -nominal : nominal );

	const claimHistories = await recap_data.findAll({
		where: {
			employee_id,
			period_year: parseInt(period_year),
			period_month: parseInt(period_month)
		}
	});

	claimHistories.forEach(history => {
		const historyNominal = parseFloat(history.dataValues.nominal);
		totalSalary = totalSalary + ((history.dataValues.claim_type == "TAX" || history.dataValues.type == "DEDUCTION" ? -historyNominal : historyNominal ));
	});
	
	if(totalSalary < 0) {
		throw new ValidationError("Not enough salary");
	}

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

		const addedRecap = await recap_data.create(payload);
		return addedRecap;
	} catch(err) {
		console.log(err);
		throw Error();
	}
}

module.exports = { addRecap };
