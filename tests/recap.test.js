const recap = require("../services/recap.sevices");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");

const Recap = {
	'created_date': expect.any(Date),
	'created_by': expect.any(String),
	'claim_type': expect.any(String),
	'claim_name': expect.any(String),
	'claim_description': expect.any(String),
	'nominal': expect.any(Number),
	'period_month': expect.any(Number),
	'period_year': expect.any(Number),
	'employee_id': expect.any(Number)
}

describe("Add recap via req body", () => {
	test("Should success add recap", async() => {
		const added_recap = await recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			nominal: 10000,
			period_year: 2022,
			period_month: 'SEPTEMBER',
			employee_id: 1,
		}, { full_name: 'magic' });
				
		expect(added_recap).toMatchObject(Recap);
	});

	test("Should failed add recap because invalid body", async() => {
		// Nominal is not provided 
		await expect(recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			period_year: 2022,
			period_month: 'SEPTEMBER',
			employee_id: 1,
		}, { full_name: 'magic' }))
		.rejects
		.toThrow(ValidationError);
		
		// Nominal is not a number 
		await expect(recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			period_year: 2022,
			period_month: 'SEPTEMBER',
			nominal: "NaN",
			employee_id: 1,
		}, { full_name: 'magic' }))
		.rejects
		.toThrow(ValidationError);
		
		// Invalid month name
		await expect(recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			period_year: 2022,
			period_month: 'JANUARY2',
			nominal: 10000,
			employee_id: 1,
		}, { full_name: 'magic' }))
		.rejects
		.toThrow(ValidationError);
	});

	test("Should failed add recap because employee not found", async() => {
		await expect(recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			period_year: 2022,
			nominal: 10000,
			period_month: 'SEPTEMBER',
			employee_id: 999,
		}, { full_name: 'magic' }))
		.rejects
		.toThrow(NotFoundError);
	});

	test("Should failed add recap because not enough salary", async() => {
		// Nominal is not provided 
		await expect(recap.addRecap({
			claim_type: 'HEALTH',
			claim_name: 'Health Check',
			claim_description: 'Monthly Health Check',
			period_year: 2022,
			nominal: 1000000000,
			period_month: 'SEPTEMBER',
			employee_id: 999,
		}, { full_name: 'magic' }))
		.rejects
		.toThrow(NotFoundError);
	});
});

describe("Add recap via file", () => {
	test("Should success add recap via file", async() => {
		const added_recaps = await recap.addRecapFile("./tests/fileInputRecap.xlsx", { full_name: "magic" })
		
		added_recaps.forEach(recap => {
			expect(recap).toMatchObject(Recap);
		});
	});

	test("Should failed if there is invalid recap in file", async() => {
		await expect(recap.addRecapFile("./tests/fileInputRecap2.xlsx", { full_name: "magic" }))
		.rejects
		.toThrow(Error);
	});
});
