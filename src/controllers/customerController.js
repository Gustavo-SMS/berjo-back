const { prismaClient } = require('../database/prismaClient')

const getAll = async (req, res) => {
    try {
        const customers = await prismaClient.customer.findMany({
            where: {
              isActive: true,
              OR: [
                {
                  user: {
                    role: 'CUSTOMER'
                  }
                },
                {
                  user: null
                }
              ]
            },
            include: {
              address: true
            }
          })

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Nenhum cliente foi encontrado' })
        }

        return res.status(200).json(customers)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getOne = async (req, res) => {
    const id = req.params.id

    try {
        const customer = await prismaClient.customer.findUnique({
            where: {
                id,
                isActive: true
            },
            include: {
                address: true
            }
        })

        if (!customer) {
            return res.status(404).json({ error: 'Cliente não foi encontrado' })
        }

        return res.status(200).json(customer)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getCustomerByName = async (req, res) => {
    const name = req.params.name

    try {
        const customers = await prismaClient.customer.findMany({
            where: {
                name,
                isActive: true
            },
            include: {
                address: true
            }
        })

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Cliente não foi encontrado' })
        }

        return res.status(200).json(customers)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getUnlinkedCustomers = async (req, res) => {
    try {
        
        const customers = await prismaClient.customer.findMany({
            where: {
                user: null,
            },
            select: {
                id: true,
                name: true
            }
        })
        
        if (customers.length === 0) {
            return res.status(404).json({ error: 'Nenhum usuário foi encontrado' })
        }

        return res.status(200).json(customers)
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuários não vinculados' })
    }
}

const createCustomer = async (req, res) => {
    const { name, email, phone, street, house_number, city, district, zip } = req.body

    try {
        const customer = await prismaClient.customer.create({
            data: {
                name,
                email,
                phone: parseInt(phone),
                address: {
                    create: {
                        street,
                        house_number: parseInt(house_number),
                        city,
                        district,
                        zip: parseInt(zip)
                    }
                }
            }
        })

        return res.status(201).json(customer)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateCustomer = async (req, res) => {
    const { id, name, email, phone, street, house_number, city, district, zip, debt } = req.body

    try {
        const customer = prismaClient.customer.update({
            where: {
                id
            },
            data: {
                name: name || undefined,
                email: email || undefined,
                phone: phone || undefined,
                debt: debt !== undefined ? debt : undefined
            }
        })

        const address = prismaClient.address.update({
            where: {
                customer_id: id
            },
            data: {
                street: street || undefined,
                house_number: house_number || undefined,
                city: city || undefined,
                district: district || undefined,
                zip: zip || undefined
            }
        })

        const transaction = await prismaClient.$transaction([customer, address])

        return res.status(201).json(transaction)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateDebt = async (customerId, totalPrice, newTotalPrice) => {

    try {
        const customer = await prismaClient.customer.findUnique({
            where: {
                id: customerId
            }
        })

        const newDebt = (customer.debt - totalPrice) + newTotalPrice

        const response = await prismaClient.customer.update({
            where: {
                id: customer.id
            },
            data: {
                debt: newDebt
            }
        })

        return response
    } catch (error) {
        console.log(error.message)
    }
}

const deleteCustomer = async (req, res) => {
    const id = req.params.id
    try {
        const customer = await prismaClient.customer.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        })

        return res.status(200).json(customer)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const restoreCustomer = async (req, res) => {
    const { id } = req.body

    try {
        const customer = await prismaClient.customer.update({
            where: {
                id
            },
            data: {
                isActive: true
            }
        })

        return res.status(200).json(customer)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAll,
    getOne,
    getCustomerByName,
    getUnlinkedCustomers,
    createCustomer,
    updateCustomer,
    updateDebt,
    deleteCustomer,
    restoreCustomer
}