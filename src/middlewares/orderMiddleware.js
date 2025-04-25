const { validate: isUuid } = require('uuid')
const { blindSchema } = require('../schema/validationSchema')
const { prismaClient } = require('../database/prismaClient')
const { calculateTotalPrice } = require("../utils/priceCalculator")

const validateId = async (req, res, next) => {
    const { id } = req.params

    if (!isUuid(id)) {
        return res.status(400).json({ error: 'ID inválido' })
    }

    try {
        const order = await prismaClient.order.findUnique({
            where: {
                id
            }
        })
        res.order = order

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }

    next()
}

const validateBlindData = async (res, blind) => {
    try {
        blind.quantity = parseInt(blind.quantity)
        blind.width = parseFloat(blind.width)
        blind.height = parseFloat(blind.height)
        blind.command_height = parseFloat(blind.command_height)

        const value = await blindSchema.validateAsync(blind)
   
        return value
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}

const totalPrice = async (req, res, next) => {
    try {
        const { blinds, customer } = req.body

        if(!customer) {
            return res.status(500).json({ error: 'Selecione um cliente' })
        }
        
        for (const blind of blinds) {
            await validateBlindData(res, blind)
        }

        req.total_price = await calculateTotalPrice(blinds)
        
        next()
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    validateId,
    totalPrice
}