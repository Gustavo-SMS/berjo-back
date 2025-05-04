const Joi = require('joi')

const userSchema = Joi.object({
    login: Joi.string().min(5).required(), 
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    confirmPassword: Joi.ref("password"),
    customerId: Joi.string().required(),
    role: Joi.string().valid('USER', 'ADMIN').optional()
})

const loginSchema = Joi.object({
    login: Joi.string().required(), 
    password: Joi.string().min(6).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    'g-recaptcha-response': Joi.string().required()
})

const customerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(), 
    email: Joi.string().email().max(40).required(), 
    docNumber: Joi.string().pattern(/^\d{11}$|^\d{14}$/).required(),
    phone: Joi.number().required(), 
    zip: Joi.number().integer().required(),
    street: Joi.string().invalid('...').required(),
    house_number: Joi.number().integer().allow('', null).optional(), 
    complement: Joi.string().allow('', null).optional(), 
    city: Joi.string().invalid('...').required(), 
    district: Joi.string().invalid('...').required(),
    state: Joi.string().invalid('...').required()
})

const blindSchema = Joi.object({
    quantity: Joi.number().required(), 
    width: Joi.number().positive().required(), 
    height: Joi.number().positive().required(), 
    command_height: Joi.number().positive().required(), 
    model: Joi.string().min(1).max(3).required(), 
    type_id: Joi.string().required(),
    observation: Joi.string().min(0).max(191).optional(),
})

const blindTypeSchema = Joi.object({
    type: Joi.string().required(), 
    collection: Joi.string().required(), 
    color: Joi.string().required(), 
    max_width: Joi.number().allow('', null).positive().optional(), 
    price: Joi.number().positive().required()
})

module.exports = {
    userSchema,
    loginSchema,
    customerSchema,
    blindSchema,
    blindTypeSchema,
}