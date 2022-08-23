class ClientError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.statusCode = 400;
    this.name = "ClientError";
    this.code = code;
  }
}

module.exports = ClientError;
