const Joi = require('joi');

const collaboratorSchema = Joi.object({
    full_name: Joi.string().required(),
    dob: Joi.string().required(),
    mobile_no: Joi.string().required(),
    email: Joi.string().email().required(),
    country_id: Joi.number().required(),
    country: Joi.string().required(),
    is_active: Joi.boolean().default(false)
  });
  
  const validateCollaborator = (req, res, next) => {
    const { error } = collaboratorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };

  module.exports = validateCollaborator;