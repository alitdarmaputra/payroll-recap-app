const userAuth = require("../services/userAuth.services");

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

const token = {
    'id': expect.any(Number),
    'token': expect.any(String),
    'userId': expect.any(Number),
}

beforeAll(async () => {
    await thisDb.sequelize.sync({ force: true })
});

test("find Hrd", async () => {
	expect(await userAuth.findHrd("magic@gmail.com")).toMatchObject(hrd);
});

test("add token", async () => {
    expect(await userAuth.addToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", 1)).toMatchObject(token);
});

afterAll(async () => {
    await thisDb.sequelize.close()
});