const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(1).required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.string().allow(null, '')
    }).required()
});

module.exports = listingSchema;