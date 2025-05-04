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

        return res.status(200).json(customers)
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuários não vinculados' })
    }
}

const createCustomer = async (req, res) => {
    const { name, email, phone, docNumber, street, house_number, complement, city, district, state, zip } = req.body
    
    const checkUniqueData = await prismaClient.customer.findFirst({
        where: {
            OR: [
                { email },
                { docNumber }
            ]
        }
    })

    if(checkUniqueData) {
        if(email === checkUniqueData.email) {
            return res.status(409).json({ error: 'Email já cadastrado'})
        } else if(docNumber === checkUniqueData.docNumber) {
            return res.status(409).json({ error: 'CPF/CNPJ já cadastrado'})
        }
    }
    
    try {
        const customer = await prismaClient.customer.create({
            data: {
                name,
                email,
                phone: parseInt(phone),
                docNumber,
                address: {
                    create: {
                        street,
                        house_number: parseInt(house_number),
                        complement,
                        city,
                        district,
                        state,
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
    const { id, name, email, docNumber, phone, street, house_number, complement, city, district, state, zip, debt } = req.body
 
    try {
        const customer = prismaClient.customer.update({
            where: {
                id
            },
            data: {
                name: name || undefined,
                email: email || undefined,
                docNumber: docNumber || undefined,
                phone: parseInt(phone) || undefined,
                debt: debt !== undefined ? debt : undefined
            }
        })

        const address = prismaClient.address.update({
            where: {
                customer_id: id
            },
            data: {
                street: street || undefined,
                house_number: parseInt(house_number) || undefined,
                complement: complement || undefined,
                city: city || undefined,
                district: district || undefined,
                state: state || undefined,
                zip: parseInt(zip) || undefined
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