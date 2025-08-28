const { User, Role } = require('../models/index')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

module.exports = {

    async logIn(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuario con sus roles
            const user = await User.findOne({
                where: { email },
                include: {
                    model: Role,
                    as: "roles",
                    attributes: ["role"],
                    through: { attributes: [] } // no mostrar tabla pivote
                }
            });

            if (!user) {
                return res.status(404).json({ msg: "Usuario con este correo no encontrado" });
            }

            // Validar contraseña
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ msg: "Contraseña incorrecta" });
            }

            // Tomar el primer rol (o todos si deseas enviar array)
            const roles = user.roles.map(r => r.role);
            const mainRole = roles[0];

            // Generar token
            let token = jwt.sign({ user: { id: user.id, email: user.email } }, authConfig.secret, {
            expiresIn: authConfig.expires
            });

            res.json({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    roles: roles
                },
                token: token
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error en login" });
        }
    },

   async signUp(req, res) {
        
        try {
            const { firstName, lastName, email, password, role } = req.body;

            // Validar que el rol sea válido
            if (!role || !["administrador", "cliente"].includes(role)) {
                return res.status(400).json({ msg: "Rol inválido. Debe ser 'administrador' o 'cliente'" });
            }

            // Encriptar contraseña
            const hashedPassword = bcrypt.hashSync(password, Number.parseInt(authConfig.rounds));

            // Crear usuario
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });

            // Buscar rol en DB
            const roleDb = await Role.findOne({ where: { role } });

            if (!roleDb) {
                return res.status(500).json({ msg: "Rol no encontrado en la base de datos" });
            }

            // Asociar rol al usuario
            await user.addRole(roleDb);


            res.status(201).json({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: roleDb.role
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Error al registrar usuario" });
        }
    },

}