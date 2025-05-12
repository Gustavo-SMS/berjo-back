const { prismaClient } = require('../database/prismaClient')

const getAll = async (req, res) => {
    try {
        const blindType = await prismaClient.blind_Type.findMany({
            where: {
                isActive: true
            }
        })

        
        if(blindType.length === 0) {
            return res.status(404).json({ error: 'Nenhum tipo foi encontrado' })
        }
        
        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getTypes = async (req, res) => {
    try {
        const blindType = await prismaClient.blind_Type.findMany({
            where: {
                isActive: true
            },
            select: {
                type: true
              }
        })
        
        if(blindType.length === 0) {
            return res.status(404).json({ error: 'Nenhum tipo foi encontrado' })
        }
        
        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getByType = async (req, res) => {
    const type = req.params.type

    try {
        const blindType = await prismaClient.blind_Type.findMany({
            where: {
                type,
                isActive: true
            }
        })

        if(blindType.length === 0) {
            return res.status(404).json({ error: 'Tipo não encontrado' })
        }

        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getByCollection = async (req, res) => {
    const collection = req.params.collection

    try {
        const blindType = await prismaClient.blind_Type.findMany({
            where: {
                collection
            }
        })

        if(blindType.length === 0) {
            return res.status(404).json({ error: 'Coleção não encontrada' })
        }

        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const createBlindType = async (req, res) => {
    const { type, collection, color, max_width, price } = req.body

    try {
        const blindType = await prismaClient.blind_Type.create({
            data: {
                type,
                collection,
                color,
                max_width: parseFloat(max_width) || undefined,
                price: parseFloat(price)
            }
        })

        if(!blindType) {
            return res.status(404).json({ error: 'Não foi possível criar o tipo de persiana' })
        }

        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const updateBlindType = async (req, res) => {
    const { id, type, collection, color, max_width, price } = req.body

    try {
        const blindType = await prismaClient.blind_Type.update({
            where: {
                id
            },
            data: {
                type: type || undefined,
                collection: collection || undefined,
                color: color || undefined,
                max_width: parseFloat(max_width) || undefined,
                price: parseFloat(price) || undefined
            }
        })

        if(!blindType) {
            return res.status(404).json({ error: 'Não foi possível atualizar o tipo de persiana' })
        }

        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const deleteBlindType = async (req, res) => {
    const id = req.params.id

    try {
        const blindType = await prismaClient.blind_Type.update({
            where: { id },
            data: { isActive: false }
          })

        if(!blindType) {
            return res.status(404).json({ error: 'Não foi possível excluir o tipo de persiana' })
        }

        return res.status(200).json(blindType)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAll,
    getTypes,
    getByType,
    getByCollection,
    createBlindType,
    updateBlindType,
    deleteBlindType
}