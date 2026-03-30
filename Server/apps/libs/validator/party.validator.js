const Joi = require('joi');

exports.createPartySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be 10 digits"
    }),

  address: Joi.string().allow('', null),

  notes: Joi.string().allow('', null),

  recordType: Joi.string().valid('CUSTOMER', 'SUPPLIER').insensitive().required()
});

exports.updatePartySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Phone must be 10 digits"
    }),

  address: Joi.string().allow('', null),

  notes: Joi.string().allow('', null),

  recordType: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER')
    .insensitive()
});