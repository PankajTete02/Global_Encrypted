const Joi = require("joi");

const namePattern = /^[a-zA-Z0-9 ]{1,50}$/;
const mobilePattern = /^\+?[1-9]\d{9,14}$/;
const emailPattern = /^[A-Za-z0-9]+([._%+-]*[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const base64ImageRegex = /^data:image\/(png|jpeg|jpg|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const collaboratorSchema = Joi.object({
  full_name: Joi.string()
    .pattern(namePattern)
    .required()
    .messages({
      "any.required": "Full name is required.",
      "string.pattern.base": "Full name must be alphanumeric and up to 50 characters."
    }),

  dob: Joi.string()
    .required()
    .messages({
      "any.required": "Date of birth is required.",
    }),

  mobile_no: Joi.string()
    .pattern(mobilePattern)
    .required()
    .messages({
      "any.required": "Mobile number is required.",
      "string.pattern.base": "Invalid mobile number format."
    }),

  email: Joi.string()
    .pattern(emailPattern)
    .required()
    .messages({
      "any.required": "Email is required.",
      "string.pattern.base": "Invalid email format."
    }),

  country_id: Joi.number()
    .required()
    .messages({ "any.required": "Country ID is required." }),

  country: Joi.string()
    .required()
    .messages({ "any.required": "Country is required." }),

  country_code: Joi.string()
    .required()
    .messages({ "any.required": "Country code is required." }),

  peacekeeper_ref_code: Joi.string()
    .required()
    .messages({ "any.required": "Ref code is required." }),

  peacekeeper_id: Joi.number()
  .required()
  .messages({ "any.required": "Peacekeeper code is required." }),

  domain_url: Joi.string()
  .required()
  .messages({ "any.required": "Domain URL is required." }),

  is_active: Joi.number()
    .valid(0, 1)
    .default(0)
    .messages({
      "any.only": "is_active must be either 0 (inactive) or 1 (active).",
    }),

  logo_image: Joi.string()
    .pattern(base64ImageRegex) // Validate format
    .required()
    .custom((value, helpers) => {
      // Extract Base64 data (remove metadata)
      const base64Data = value.split(',')[1];

      // Convert Base64 to Buffer to get size in bytes
      const buffer = Buffer.from(base64Data, 'base64');
      const fileSizeInMB = buffer.length / (1024 * 1024); // Convert to MB

      if (fileSizeInMB > 5) {
        return helpers.error('any.invalid', { message:'Image size must be less than 5MB' });
      }

      return value;
    })
    .messages({
      "string.pattern.base": "Invalid image format. Only PNG, JPEG, or SVG allowed.",
      "any.required": "Image is required.",
      "any.invalid": "Image size must be less than 5MB."
    })

});

const validateCollaborator = (req, res, next) => {
  const { error } = collaboratorSchema.validate(req.body, { abortEarly: false });  // Validate all fields
  if (error) {
    const errors = error.details.map((err) => ({
      errorCode: "VALIDATION_ERROR",
      field: err.context.key,
      errorMessage: err.message
    }));

    return res.status(400).json({ errors });
  }
  next();
};

module.exports = validateCollaborator;
