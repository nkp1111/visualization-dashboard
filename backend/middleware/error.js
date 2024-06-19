const {
  ReasonPhrases,
  StatusCodes,
} = require("http-status-codes");

exports.errorMiddleware = (error, req, res, next) => {
  // handle error response
  if (error.name) {
    res.status(StatusCodes.BAD_REQUEST).send({
      error: ReasonPhrases.BAD_REQUEST,
      message: error.message,
    });
  } else if (error.code === 11000) {
    res.status(StatusCodes.CONFLICT).send({
      error: ReasonPhrases.CONFLICT,
      message: "Duplicate field error",
    });
  } else {
    console.log("Error middleware: ", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
    });
  }
}