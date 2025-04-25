const { prismaClient } = require('../database/prismaClient')
const { sendEmail, generateHtmlTable } = require('../services/nodemailer')
const { calculateTotalPrice } = require("../utils/priceCalculator")
const customerController = require('./customerController')

const getAll = async (req, res) => {
    try {
        const orders = await prismaClient.order.findMany({
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                blind: {
                    include: {
                        type: {
                            select: {
                                id: true,
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }

                },
            }
        })

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Nenhum pedido foi encontrado' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getOne = async (req, res) => {
    const id = req.params.id

    try {
        const order = await prismaClient.order.findUnique({
            where: {
                id
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                blind: {
                    include: {
                        type: {
                            select: {
                                id: true,
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }

                },
            }
        })

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' })
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getOrdersByCustomer = async (req, res) => {
    const id = req.params.id

    try {
        const orders = await prismaClient.order.findMany({
            where: {
                customer_id: id
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                blind: {
                    include: {
                        type: {
                            select: {
                                id: true,
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }

                },
            }
        })

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Nenhum pedido foi encontrado' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getOrdersByStatus = async (req, res) => {
    const status = req.params.status

    try {
        const orders = await prismaClient.order.findMany({
            where: {
                status
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                blind: {
                    include: {
                        type: {
                            select: {
                                id: true,
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }

                },
            }
        })

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Nenhum pedido foi encontrado' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getOrdersByFilter = async (req, res) => {
    const { status, customerId } = req.query

    try {
        const orders = await prismaClient.order.findMany({
            where: {
                AND: [
                    { customer_id: customerId },
                    { status: status }
                ]
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                },
                blind: {
                    include: {
                        type: {
                            select: {
                                id: true,
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }

                },
            }
        })

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Nenhum pedido foi encontrado' })
        }

        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const createOrder = async (req, res) => {
    const { customer, blinds } = req.body
    const total_price = req.total_price

    try {
        const order = await prismaClient.order.create({
            data: {
                customer: {
                    connect: { id: customer }
                },
                total_price,
                blind: {
                    create:
                        blinds
                }
            }
        })
        if (!order) {
            return res.status(404).json({ error: 'Não foi possível criar o pedido' })
        }

        const getCustomer = await prismaClient.customer.findUnique({
            where: {
                id: order.customer_id
            }
        })

        const newDebt = getCustomer.debt + total_price
        await prismaClient.customer.update({
            where: {
                id: getCustomer.id
            },
            data: {
                debt: newDebt
            }
        })

        return res.status(201).json(order)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const changeStatus = async (req, res) => {
    const { id, status } = req.body

    try {
        const order = await prismaClient.order.update({
            where: {
                id
            },
            data: {
                status: status || undefined
            }
        })

        if (!order) {
            return res.status(404).json({ error: 'Não foi possível atualizar o pedido' })
        }

        if (status === "Concluido" && status) {
            createMail(id)
        }

        return res.status(201).json(order)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const createMail = async (id) => {
    const order = await getBlindsToMail(id)

    const name = order.customer.name
    const email = order.customer.email
    const total_price = order.total_price

    const blindsEmail = order.blind.map(blind => ({
        Qtde: blind.quantity,
        Largura: blind.width,
        Altura: blind.height,
        Modelo: blind.model,
        Tipo: blind.type.type,
        Coleção: blind.type.collection,
        Cor: blind.type.color,
    }))

    const tabela = generateHtmlTable(blindsEmail)

    const html = `
    <p>Olá, ${name}!</p>
    <p>Seu pedido está pronto. Aqui estão os detalhes:</p>
    ${tabela}
    <p><strong>Total: R$ ${total_price}</strong></p>
    <p>Obrigado por comprar conosco!</p>
  `

    await sendEmail({
        to: email,
        subject: 'Pedido pronto',
        html,
    })
}

const getBlindsToMail = async (id) => {
    try {
        const order = await prismaClient.order.findUnique({
            where: {
                id
            },
            select: {
                total_price: true,
                customer: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                blind: {
                    select: {
                        quantity: true,
                        width: true,
                        height: true,
                        model: true,
                        type: {
                            select: {
                                type: true,
                                collection: true,
                                color: true
                            }
                        }
                    }
                }
            }
        })

        return order
    } catch (error) {
        return error.message
    }
}

const updateOrder = async (req, res) => {
    const { id, status, total_price } = req.body

    try {
        const order = await prismaClient.order.update({
            where: {
                id
            },
            data: {
                status: status || undefined,
                total_price: total_price || undefined
            }
        })

        if (!order) {
            S
            return res.status(404).json({ error: 'Não foi possível atualizar o pedido' })
        }

        return res.status(201).json(order)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateTotalPrice = async (orderId) => {
    try {
        const order = await prismaClient.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                blind: true
            }
        })

        if (!order) return res.status(404).json({ error: "Pedido não encontrado" })

        const newTotalPrice = await calculateTotalPrice(order.blind)

        const response = await prismaClient.order.update({
            where: {
                id: order.id
            },
            data: {
                total_price: newTotalPrice
            }
        })

        customerController.updateDebt(order.customer_id, order.total_price, newTotalPrice)

        return response
    } catch (error) {
        console.log(error.message)
    }
}

const deleteOrder = async (req, res) => {
    const id = req.params.id

    try {
        const blind = prismaClient.blind.deleteMany({
            where: {
                order_id: id
            }
        })

        const order = prismaClient.order.delete({
            where: {
                id
            }
        })

        const transaction = await prismaClient.$transaction([blind, order])

        if (!transaction) {
            return res.status(404).json({ error: 'Não foi possível excluir o pedido' })
        }

        return res.status(200).json(transaction)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


module.exports = {
    getAll,
    getOne,
    getOrdersByCustomer,
    getOrdersByStatus,
    createOrder,
    changeStatus,
    updateOrder,
    deleteOrder,
    getOrdersByFilter,
    updateTotalPrice
}