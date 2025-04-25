const { customerSchema } = require('../schema/validationSchema')

const validateCustomerData = async (req, res, next) => {
    const data = req.body

    try {
        const value = await customerSchema.validateAsync(data);
   
        if(value) {
            next()
        }
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}

module.exports = {
    validateCustomerData
}