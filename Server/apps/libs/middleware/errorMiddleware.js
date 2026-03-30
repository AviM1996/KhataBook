module.exports = (err, req, res, next) => {

  console.error(err);

  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res.validationError("Validation failed", err.errors);
  }

  if (err.name === "UnauthorizedError") {
    return res.unauthorized("Unauthorized");
  }

  return res.serverError(err.message || "Something went wrong");
};