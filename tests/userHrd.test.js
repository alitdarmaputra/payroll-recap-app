const userHrd = require("../services/userHrd.services");
const { user_hrd } = require("../models");
const ValidationError = require("../errors/ValidationError");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const paginationDTO = require("../models/dto/pageResponse.dto");

const hrd = {
    'id': expect.any(Number),
    'username': expect.any(String),
    'full_name': expect.any(String),
    'email': expect.any(String),
    'password': expect.any(String),
    'status': expect.any(String),
    'failed_login': expect.any(Number),
    'is_login': expect.any(Boolean),
    'created_date': expect.any(Date),
    'updated_date': expect.any(Date),
}

let added_hrd;

describe("Create hrd test", () => {
	test("Should success add hrd", async () => {
		added_hrd = await userHrd.addHrd({
			username: "unitest_username",
			full_name: "unitest_fullname",
			email: "unitest@gmai.com", 
			password: "unitest_password"
		});
		expect(added_hrd).toMatchObject(hrd);
	});

	test("Should failed submit duplicate data", async () => {
		// Duplicate username
		await expect(userHrd.addHrd({
			username: "unitest_username",
			full_name: "unitest_fullname",
			email: "unitest@gmai.com", 
			password: "unitest_password"
		}))
		.rejects
		.toThrow(ConflictError);
		
		// Duplicate email
		await expect(userHrd.addHrd({
			username: "unitest_1_username",
			full_name: "unitest_1_fullname",
			email: "unitest@gmai.com", 
			password: "unitest_password"
		}))
		.rejects
		.toThrow(ConflictError);

	});

	test("Should failed submit invalid body", async () => {
		// full_name less than 5 char
		await expect(userHrd.addHrd({
			username: "unitest_username",
			full_name: "uni",
			email: "unitest@gmai.com", 
			password: "unitest_password"
		}))
		.rejects
		.toThrow(ValidationError);

		// password less than 6 char
		await expect(userHrd.addHrd({
			username: "unitest_username",
			full_name: "unitest_fullname",
			email: "unitest@gmai.com", 
			password: "unit"
		}))
		.rejects
		.toThrow(ValidationError);

		// username less than 5 char
		await expect(userHrd.addHrd({
			username: "123",
			full_name: "unitest_fullname",
			email: "unitest@gmai.com", 
			password: "unitest_password"
		}))
		.rejects
		.toThrow(ValidationError);

		// Invalid email format
		await expect(userHrd.addHrd({
			username: "unitest_username",
			full_name: "unitest_fullname",
			email: "unitest.com", 
			password: "unitest_password"
		}))
		.rejects
		.toThrow(ValidationError);

		// Empty body
		await expect(userHrd.addHrd({}))
		.rejects
		.toThrow(ValidationError);
	});
});

describe("Get hrd test", () => {
	test("Should success get hrd", async() => {
		const hrd_detail = await userHrd.getHrd(added_hrd.id);
		expect(hrd_detail).toMatchObject(hrd);
	});

	test("Should failed if hrd doesn't exist", async() => {
		await expect(userHrd.getHrd(9999))
		.rejects
		.toThrow(NotFoundError);
	});
});

describe("Delete hrd test", () => {
	test("Should success delete hrd", async() => {
		await userHrd.deleteHrd(added_hrd.id);
		const deleted_hrd = await userHrd.getHrd(added_hrd.id);
		expect(deleted_hrd).toHaveProperty("status", "DELETED");
	});

	test("Should failed if hrd doesn't exist", async() => {
		await expect(userHrd.deleteHrd(9999))
		.rejects
		.toThrow(NotFoundError);
	});
});

describe("Edit hrd test", () => {
	test("Should success edit hrd", async() => {
		await userHrd.editHrd({ id: added_hrd.id, status: "ACTIVE" });
		const edited_hrd = await userHrd.getHrd(added_hrd.id);
		expect(edited_hrd).toHaveProperty("status", "ACTIVE");
	});

	test("Should failed if hrd doesn't exist", async() => {
		await expect(userHrd.editHrd({ id: 9999, status: "ACTIVE" }))
		.rejects
		.toThrow(NotFoundError);
	});

	test("Should failed if invalid body", async() => {
		const another_hrd = await userHrd.addHrd({
			username: "unitest_1_username",
			full_name: "unitest_1_fullname",
			email: "unitest_1_@gmai.com", 
			password: "unitest_password"
		});
		// Use same username with others
		await expect(userHrd.editHrd({ id: another_hrd.id, username: "unitest_username" }))
		.rejects
		.toThrow(ConflictError);
		
		// Use same emaul with other
		await expect(userHrd.editHrd({ id: another_hrd.id, email: "unitest@gmai.com" }))
		.rejects
		.toThrow(ConflictError);
		
		// Use invalid email
		await expect(userHrd.editHrd({ id: another_hrd.id, email: "unittest.com" }))
		.rejects
		.toThrow(ValidationError);

		// username less than 5 char
		await expect(userHrd.editHrd({ id: another_hrd.id, username: "uni" }))
		.rejects
		.toThrow(ValidationError);
		
		// full_name less than 5 char
		await expect(userHrd.editHrd({ id: another_hrd.id, full_name: "a" }))
		.rejects
		.toThrow(ValidationError);
			
		// Send null data
		await expect(userHrd.editHrd({ id: another_hrd.id, full_name: null }))
		.rejects
		.toThrow(ValidationError);

		await user_hrd.destroy({ where: { id: another_hrd.id } });
	});
});

describe("List hrd test", () => {
	test("Should success list hrd", async() => {
		const list_hrds = await userHrd.listHrd({ page: 1, full_name: "test" });
		expect(list_hrds).toBeInstanceOf(paginationDTO);

		await user_hrd.destroy({ where: { id: added_hrd.id } });
	});
});
