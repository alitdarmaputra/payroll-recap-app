const userHrd = require("../services/userHrd.services");

const hrd = {
	username: "Alit2",
	full_name: "Alit2",
	password: "1234567", 
	email: "test3@gmail.com"
} 

test("test 1", async () => {
	expect(await userHrd.addHrd(hrd)).toHaveProperty("username");
});
