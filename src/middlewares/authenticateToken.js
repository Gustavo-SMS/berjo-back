const jwt = require('jsonwebtoken')
const { prismaClient } = require('../database/prismaClient')

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token']

    if (!token && !refreshToken) {
        return res.status(401).json({ msg: 'Token não fornecido.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {
            id: decoded.id,
            role: decoded.role,
            customerId: decoded.customerId
        }

        return next()
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).json({ msg: 'Sessão expirada. Faça login novamente.' })
        }

        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

            const user = await prismaClient.user.findUnique({
                where: { id: decodedRefresh.id }
            })

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ msg: 'Refresh token inválido.' })
            }

            const newAccessToken = jwt.sign(
                {
                    id: user.id,
                    role: user.role,
                    customerId: user.customerId || null
                },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            )

            res.setHeader('x-access-token', newAccessToken)
            res.setHeader('Access-Control-Expose-Headers', 'x-access-token')

            req.user = {
                id: user.id,
                role: user.role,
                customerId: user.customerId || null
            }

            return next()
        } catch (refreshError) {
            return res.status(403).json({ msg: 'Refresh token expirado ou inválido. Faça login novamente.' })
        }
    }
}

module.exports = {
    authenticateToken
}