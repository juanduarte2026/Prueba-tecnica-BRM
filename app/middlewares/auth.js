const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const { User } = require('../models/index')

module.exports = (req, res, next) => {


    if(!req.headers.authorization){
        res.status(401).json({msg: "Acceso denegado"})

    } else {

        let token = req.headers.authorization.split(" ")[1] 

        jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(500).json({ msg: "Error al decodificar token", err })

        const userId = decoded.id ?? decoded.user?.id
        User.findByPk(userId, { include: "roles" }).then(user => {
            if (!user) return res.status(404).json({ msg: "Usuario no encontrado" })
            req.user = user
            next()
        })
        })
    }

}