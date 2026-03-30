/**
 * Joi validation middleware factory.
 * Usage: validate(schema) - validates req.body against the given Joi schema.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // collect ALL errors, not just the first
    stripUnknown: true,  // remove unknown fields from req.body
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  req.body = value; // replace body with sanitized value
  next();
};

module.exports = validate;
