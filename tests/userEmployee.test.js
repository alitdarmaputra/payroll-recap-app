const employeeServices = require('../services/userEmployee.services');

const { user_employee } = require('../models');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const paginationDTO = require('../models/dto/pageResponse.dto');

const employee = {
	id: expect.any(Number),
	full_name: expect.any(String),
	email: expect.any(String),
	status: expect.any(String),
	salary: expect.any(Number),
	created_date: expect.any(Date),
	updated_date: expect.any(Date),
};

let added_employee;

describe('Create employee test', () => {
	test('Should success add employee', async () => {
		added_employee = await employeeServices.createEmployee({
			full_name: 'unitest_fullname',
			email: 'unitest@mail.com',
			salary: 1000000,
		});
		expect(added_employee).toMatchObject(employee);
	});

	test('Should failed submit duplicate email', async () => {
		await expect(
			employeeServices.createEmployee({
				full_name: 'unitest_fullname',
				email: 'unitest@mail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ConflictError);
	});

	test('Should failed submit fullname less than 4 char', async () => {
		await expect(
			employeeServices.createEmployee({
				full_name: 'uni',
				email: 'unitest1@mail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});

	test('Should failed submit invalid email', async () => {
		await expect(
			employeeServices.createEmployee({
				full_name: 'unitest_fullname',
				email: 'unitestmail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});

	test('Should failed if a field is null', async () => {
		await expect(
			employeeServices.createEmployee({
				full_name: 'unitest_fullname',
				email: null,
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});
});

describe('edit employee test', () => {
	test('Should success edit employee', async () => {
		const edited_employee = await employeeServices.editEmployee({
			id: added_employee.id,
			full_name: 'unitest_fullname_edited',
			email: 'unitest_edited@mail.com',
			salary: 1000000,
		});
		expect(edited_employee).toHaveProperty('updated_date');
	});

	test('Should failed if employee not found', async () => {
		await expect(
			employeeServices.editEmployee(999999, {
				full_name: 'unitest_fullname_edited',
				email: 'unitest_edited@mail.com',
				salary: 1000000,
			})
		).rejects.toThrow(NotFoundError);
	});

	test('Should failed submit duplicate email', async () => {
		const another_employee = await employeeServices.createEmployee({
			full_name: 'test1',
			email: 'test@mail.com',
			salary: 1000000,
		});
		await expect(
			employeeServices.editEmployee({
				id: added_employee.id,
				full_name: 'unitest_fullname_edited',
				email: 'test@mail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);

		await user_employee.destroy({
			where: { id: another_employee.id },
		});
	});

	test('Should failed submit fullname less than 4 char', async () => {
		await expect(
			employeeServices.editEmployee({
				id: added_employee.id,
				full_name: 'uni',
				email: 'unitest@mail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});

	test('Should failed submit invalid email', async () => {
		await expect(
			employeeServices.editEmployee({
				id: added_employee.id,
				full_name: 'unitest_fullname',
				email: 'unitestmail.com',
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});

	test('Should failed if a field is null', async () => {
		await expect(
			employeeServices.editEmployee({
				id: added_employee.id,
				full_name: 'unitest_fullname',
				email: null,
				salary: 1000000,
			})
		).rejects.toThrow(ValidationError);
	});
});

describe('list employee test', () => {
	test('Should success list employee', async () => {
		const list_employee = await employeeServices.listEmployee(
			{ full_name: 'unitest' },
			{
				page: 1,
				size: 10,
			}
		);
		expect(list_employee).toBeInstanceOf(paginationDTO);
	});
});

describe('show detail employee test', () => {
	test('Should success show detail employee', async () => {
		const detail_employee = await employeeServices.showEmployee(
			added_employee.id
		);
		expect(detail_employee).toHaveProperty('id');
		expect(detail_employee).toHaveProperty('full_name');
		expect(detail_employee).toHaveProperty('email');
		expect(detail_employee).toHaveProperty('status');
		expect(detail_employee).toHaveProperty('salary');
		expect(detail_employee).toHaveProperty('created_date');
		expect(detail_employee).toHaveProperty('updated_date');
	});

	test('Should failed if employee not found', async () => {
		await expect(employeeServices.showEmployee(999999)).rejects.toThrow(
			NotFoundError
		);
	});
});

describe('delete employee test', () => {
	test('Should success delete employee', async () => {
		await employeeServices.deleteEmployee(added_employee.id);
		const deleted_employee = await employeeServices.showEmployee(
			added_employee.id
		);
		expect(deleted_employee).toHaveProperty('status', 'DELETED');

		await user_employee.destroy({
			where: { id: added_employee.id },
		});
	});

	test('Should failed delete employee if employee not exist', async () => {
		await expect(employeeServices.deleteEmployee(9999)).rejects.toThrow(
			NotFoundError
		);
	});
});
