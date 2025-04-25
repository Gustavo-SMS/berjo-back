const jwt = require('jsonwebtoken')
const { prismaClient }  = require('../database/prismaClient')

async function authenticateToken(req, res, next) {
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken
    
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

            res.cookie('token', newAccessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 
            })

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