const Joi = require('joi');

const namePattern = /^[a-zA-Z0-9 ]{1,50}$/;
const mobilePattern = /^\+?[1-9]\d{9,14}$/;
const addressPattern = /^[a-zA-Z0-9\s,.'\-/#]{1,100}$/; 
const emailPattern = /^[A-Za-z0-9]+([._%+-]*[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const sponsorshipSchema = Joi.object({
  sponsorship_type: Joi.string().valid('patron', 'partner').required(),
  sponsorship_name: Joi.string().pattern(namePattern).required(),
  poc_name: Joi.string().pattern(namePattern).required(),
  poc_mobile: Joi.string().pattern(mobilePattern).required(),
  poc_email: Joi.string().pattern(emailPattern).email().required(),
  country_id: Joi.number().required(),
  country: Joi.string().required(),
  state_id: Joi.number().required(),
  state: Joi.string().required(),
  city_id: Joi.number().required(),
  city: Joi.string().required(),
  address: Joi.string().pattern(addressPattern).required(),
  ref_by: Joi.string().valid('peacekeeper', 'other').allow(null,'').optional(),
  peacekeeper_other_name: Joi.string().allow(null,'').optional(),
  peacekeeper_id: Joi.number().allow(null,'').optional(),
  is_active: Joi.number().valid(0, 1).default(0)
});

const validateSponsorship = (req, res, next) => {
  const { error } = sponsorshipSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validateSponsorship;