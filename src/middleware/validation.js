const Joi = require("joi");

const namePattern = /^[a-zA-Z0-9 ]{1,50}$/;
const mobilePattern = /^\+?[1-9]\d{9,14}$/;
const addressPattern = /^[a-zA-Z0-9\s,.'\-/#]{1,100}$/;
const emailPattern = /^[A-Za-z0-9]+([._%+-]*[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const sponsorshipSchema = Joi.object({
  sponsorship_type: Joi.string()
    .valid("patron", "partner")
    .required()
    .messages({
      "any.required": "Sponsorship type is required.",
      "any.only": "Sponsorship type must be either 'patron' or 'partner'.",
    }),

  sponsorship_name: Joi.string()
    .pattern(namePattern)
    .required()
    .messages({
      "any.required": "Sponsorship name is required.",
      "string.pattern.base": "Sponsorship name must be alphanumeric and up to 50 characters.",
    }),

  poc_name: Joi.string()
    .pattern(namePattern)
    .required()
    .messages({
      "any.required": "POC name is required.",
      "string.pattern.base": "POC name must be alphanumeric and up to 50 characters.",
    }),

  poc_mobile: Joi.string()
    .pattern(mobilePattern)
    .required()
    .messages({
      "any.required": "POC mobile number is required.",
      "string.pattern.base": "Invalid mobile number format.",
    }),

  poc_email: Joi.string()
    .pattern(emailPattern)
    .required()
    .messages({
      "any.required": "POC email is required.",
      "string.pattern.base": "Invalid email format.",
    }),

  country_id: Joi.number()
    .required()
    .messages({ "any.required": "Country ID is required." }),

  country: Joi.string()
    .required()
    .messages({ "any.required": "Country name is required." }),

  state_id: Joi.number()
    .required()
    .messages({ "any.required": "State ID is required." }),

  state: Joi.string()
    .required()
    .messages({ "any.required": "State name is required." }),

  city_id: Joi.number()
    .required()
    .messages({ "any.required": "City ID is required." }),

  city: Joi.string()
    .required()
    .messages({ "any.required": "City name is required." }),

  address: Joi.string()
    .pattern(addressPattern)
    .required()
    .messages({
      "any.required": "Address is required.",
      "string.pattern.base": "Address contains invalid characters or exceeds 100 characters.",
    }),

  ref_by: Joi.string()
    .valid("peacekeeper", "other")
    .allow(null, "")
    .optional()
    .messages({
      "any.only": "Ref by must be either 'peacekeeper' or 'other'.",
    }),

  peacekeeper_other_name: Joi.string()
    .allow(null, "")
    .optional(),

  peacekeeper_id: Joi.number()
    .allow(null, "")
    .optional(),

  is_active: Joi.number()
    .valid(0, 1)
    .default(0)
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
