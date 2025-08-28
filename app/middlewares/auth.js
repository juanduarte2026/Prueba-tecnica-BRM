const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const { User } = require('../models/index')
const logger = require('../utils/logger')

module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            logger.warn('Acceso sin token')
            return res.status(401).json({ msg: "Acceso denegado" })
        }

        let token = req.headers.authorization.split(" ")[1]

        const decoded = jwt.verify(token, authConfig.secret)
        const userId = decoded.id ?? decoded.user?.id
        
        const user = await User.findByPk(userId, { include: "roles" })
        
        if (!user) {
            logger.warn(`Usuario no encontrado: ${userId}`)
            return res.status(404).json({ msg: "Usuario no encontrado" })
        }

        req.user = user
        logger.info(`Usuario autenticado: ${user.email}`)
        next()

    } catch (error) {
        logger.error(`Error de autenticación: ${error.message}`)
        return res.status(500).json({ msg: "Error al verificar token" })
    }
}