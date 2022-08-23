const ClientError = require("../errors/ClientError");

const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.code).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: err?.errors || null,
    });
  }
  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal server error",
    data: null,
  });
};

module.exports = errorHandler;
