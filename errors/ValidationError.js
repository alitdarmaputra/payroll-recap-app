const ClientError = require("./ClientError");

class ValidationError extends ClientError {
  constructor(message, errors) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

module.exports = ValidationError;
