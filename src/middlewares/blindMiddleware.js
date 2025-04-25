const { blindSchema } = require('../schema/validationSchema')
const { prismaClient } = require('../database/prismaClient')


const validateBlindData = async (req, res, next) => {
    const data = req.body

    try {
        const value = await blindSchema.validateAsync(data)

        const order = await checkOrderId(res, data.orderId)
        const blindType = await checkBlindTypeId(res, data.blindTypeId)

        if (!order) {
            return res.status(500).json({ error: "Pedido não encontrado" })
        } else if (!blindType) {
            return res.status(500).json({ error: "Tipo não encontrado" })
        } else if (value) {
            next()
        }
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}

const checkOrderId = async (res, id) => {
    try {
        const order = await prismaClient.order.findUnique({
            where: {
                id: id
            }
        })

        if (order) {
            return order
        } else {
            return undefined
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const checkBlindTypeId = async (res, id) => {
    try {
        const blindType = await prismaClient.blind_Type.findUnique({
            where: {
                id
            }
        })

        if (blindType) {
            return blindType
        }

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const calculateBlindPrice = async (req, res, next) => {
    const blind = req.body
    
    try {
        const squareMetre = blind.width * blind.height
        blind.square_metre = squareMetre * blind.quantity

        const blindPrice = await prismaClient.blind_Type.findUnique({
            where: { id: blind.type_id },
            select: { price: true }
        })

        if (!blindPrice) throw new Error("Tipo de persiana não encontrado")

        blind.blind_price = blind.square_metre * blindPrice.price

        next()
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    validateBlindData,
    calculateBlindPrice
}