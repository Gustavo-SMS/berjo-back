const { blindTypeSchema } = require('../schema/validationSchema')


const validateBlindTypeData = async (req, res, next) => {
    const data = req.body

    try {
        const value = await blindTypeSchema.validateAsync(data);
   
        if(value) {
            next()
        }
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}

module.exports = {
    validateBlindTypeData
}