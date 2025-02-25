const Joi = require("joi");

const namePattern = /^[a-zA-Z0-9 -]{1,50}$/;
const mobilePattern = /^\+?[1-9]\d{9,14}$/;
const addressPattern = /^[a-zA-Z0-9\s,.'\-/#]{1,100}$/;
const emailPattern = /^[A-Za-z0-9]+([._%+-]*[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const sponsorshipSchema = Joi.object({
  sponsorship_type_id: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "Sponsorship type id is required."
    }),

  sponsorship_type: Joi.string()
  .trim()
  .required()
  .messages({
    "any.required": "Sponsorship type is required."
  }),

  sponsorship_name: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "Sponsorship name is required."
    }),

  poc_name: Joi.string()
    .trim()
    .pattern(namePattern)
    .required()
    .messages({
      "any.required": "POC name is required.",
      "string.pattern.base": "POC name must be alphanumeric and up to 50 characters.",
    }),

  poc_mobile: Joi.string()
    .trim()
    .pattern(mobilePattern)
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base": "Invalid mobile number format.",
    }),

  poc_email: Joi.string()
    .trim()
    .pattern(emailPattern)
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),

  country_id: Joi.number().min(0).allow("", null).optional(),

  country: Joi.string().trim().allow("", null).optional(),

  state_id: Joi.number().min(0).allow("", null).optional(),

  state: Joi.string().trim().allow("", null).optional(),

  city_id: Joi.number().min(0).allow("", null).optional(),

  city: Joi.string().allow("", null).trim().optional(),

  address: Joi.string()
    .trim()
    .pattern(addressPattern)
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base": "Address contains invalid characters or exceeds 100 characters.",
    }),

  ref_by: Joi.string()
    .trim()
    .valid("peacekeeper", "other")
    .allow("")
    .optional()
    .messages({
      "any.only": "Ref by must be either 'peacekeeper' or 'other'.",
    }),

  peacekeeper_other_name: Joi.string()
    .trim()
    .allow("")
    .optional(),

  peacekeeper_id: Joi.number()
    .allow(null, "")
    .optional(),

  is_active: Joi.number()
    .valid(0, 1)
    .default(1)
    .messages({
      "any.only": "is_active must be either 0 (inactive) or 1 (active).",
    }),
});

// Custom error handler with error codes
const validateSponsorship = (req, res, next) => {
  const { error } = sponsorshipSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      errorCode: "VALIDATION_ERROR",
      field: err.context.key,
      errorMessage: err.message,
    }));

    return res.status(400).json({ errors });
  }
  next();
};

module.exports = validateSponsorship;
