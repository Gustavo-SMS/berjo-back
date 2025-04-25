const { prismaClient } = require('../database/prismaClient')
const orderController = require('./orderController')

const getAll = async (req, res) => {
    try {
        const blind = await prismaClient.blind.findMany({})

        if(blind.length === 0) {
            return res.status(404).json({ error: 'Nenhuma persiana foi encontrada' })
        }
        
        return res.status(200).json(blind)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const createBlind = async (req, res) => {
    const { quantity, width, height, command_height, model, observation, square_metre, blind_price, blindTypeId, orderId } = req.body

    try {
        const blind = await prismaClient.blind.create({
            data: {
                quantity: parseInt(quantity),
                width: parseFloat(width),
                height: parseFloat(height),
                command_height: parseFloat(command_height),
                model,
                observation,
                square_metre,
                blind_price,
                type: {
                    connect: { id: blindTypeId }
                },
                order: {
                    connect: { id: orderId }
                }
            }
        })

        if(!blind) {
            return res.status(404).json({ error: 'Não foi possível criar a persiana' })
        }

        return res.status(200).json(blind)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateBlind = async (req, res) => {
    const { id, quantity, width, height, command_height, model, observation, square_metre, blind_price, type_id } = req.body

    try {
        const blind = await prismaClient.blind.update({
            where: {
                id
            },
            data: {
                quantity: parseInt(quantity) || undefined,
                width: parseFloat(width) || undefined,
                height: parseFloat(height) || undefined,
                command_height: parseFloat(command_height) || undefined,
                model: model || undefined,
                observation: observation || undefined,
                square_metre: parseFloat(square_metre) || undefined,
                blind_price: blind_price || undefined,
                type_id: type_id || undefined
            }
        })

        if(!blind) {
            return res.status(404).json({ error: 'Não foi possível atualizar a persiana' })
        }

        orderController.updateTotalPrice(blind.order_id)

        return res.status(200).json(blind)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const deleteBlind = async (req, res) => {
    const id = req.params.id

    try {
        const blind = await prismaClient.blind.delete({
            where: {
              id
            }
          })

        await prismaClient.order.update({
            where: {
                id: blind.order_id
            },
            data: {
                total_price: {
                    decrement: blind.blind_price
                }
            }
        })

        return res.status(200).json(blind)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAll,
    createBlind,
    updateBlind,
    deleteBlind
}