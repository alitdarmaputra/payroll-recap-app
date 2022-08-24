const ClientError = require("../errors/ClientError");

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: null,
    });
  }
  console.log(err)
  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal server error",
    data: null,
  });
};

module.exports = errorHandler;
