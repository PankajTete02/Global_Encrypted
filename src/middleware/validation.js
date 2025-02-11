const Joi = require('joi');

const sponsorshipSchema = Joi.object({
  sponsorship_type: Joi.string().valid('patron', 'partner').required(),
  sponsorship_name: Joi.string().required(),
  poc_name: Joi.string().required(),
  poc_mobile: Joi.string().required(),
  poc_email: Joi.string().email().required(),
  country_id: Joi.number().required(),
  country: Joi.string().required(),
  state_id: Joi.number().required(),
  state: Joi.string().required(),
  city_id: Joi.number().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  ref_by: Joi.string().valid('peacekeeper', 'other').required(),
  peacekeeper_other_name: Joi.string().required(),
  peacekeeper_id: Joi.number().allow(null).optional(),
  is_active: Joi.boolean().default(false)
});

const validateSponsorship = (req, res, next) => {
  const { error } = sponsorshipSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateSponsorship;
