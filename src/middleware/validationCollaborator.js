const Joi = require('joi');

const namePattern = /^[a-zA-Z0-9 ]{1,50}$/;
const mobilePattern = /^\+?[1-9]\d{9,14}$/;
const emailPattern = /^[A-Za-z0-9]+([._%+-]*[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const base64ImageRegex = /^data:image\/(png|jpeg|jpg|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const collaboratorSchema = Joi.object({
    full_name: Joi.string().pattern(namePattern).required(),
    dob: Joi.string().required(),
    mobile_no: Joi.string().pattern(mobilePattern).required(),
    email: Joi.string().pattern(emailPattern).email().required(),
    country_id: Joi.number().required(),
    country: Joi.string().required(),
    is_active: Joi.number().valid(0, 1).default(0),
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
                  return helpers.error('any.invalid', 'Image size must be less than 5MB');
                }

                return value;
              })
              .messages({
                'string.pattern.base': 'Invalid image format. Only PNG, JPEG, or SVG allowed.',
                'any.required': 'Image is required.',
                'any.invalid': 'Image size must be less than 5MB.'
              })
  });
  
  const validateCollaborator = (req, res, next) => {
    const { error } = collaboratorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };

  module.exports = validateCollaborator;