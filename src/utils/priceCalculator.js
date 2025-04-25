const { prismaClient } = require("../database/prismaClient")

const calculateTotalPrice = async (blinds) => {
    let totalPrice = 0
    
    for (const blind of blinds) {
        const squareMetre = blind.width * blind.height
        blind.square_metre = squareMetre * blind.quantity

        const blindPrice = await prismaClient.blind_Type.findUnique({
            where: { id: blind.type_id },
            select: { price: true }
        })

        if (!blindPrice) throw new Error("Tipo de persiana não encontrado")

        blind.blind_price = blind.square_metre * blindPrice.price

        totalPrice += blind.square_metre * blindPrice.price
    }

    return totalPrice
}

module.exports = { calculateTotalPrice }