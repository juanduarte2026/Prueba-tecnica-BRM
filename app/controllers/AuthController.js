const { User, Role } = require('../models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const logger = require('../utils/logger');

module.exports = {

    async logIn(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ msg: "Email y password requeridos" });
            }

            const user = await User.findOne({
                where: { email },
                include: {
                    model: Role,
                    as: "roles",
                    attributes: ["role"],
                    through: { attributes: [] }
                }
            });

            if (!user) {
                logger.warn(`Login fallido - usuario no encontrado: ${email}`);
                return res.status(404).json({ msg: "Credenciales inválidas" });
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                logger.warn(`Login fallido - password incorrecto: ${email}`);
                return res.status(401).json({ msg: "Credenciales inválidas" });
            }

            const roles = user.roles.map(r => r.role);
            const token = jwt.sign({ user: { id: user.id, email: user.email } }, authConfig.secret, {
                expiresIn: authConfig.expires
            });

            logger.info(`Login exitoso: ${email}`);
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

        } catch (error) {
            logger.error(`Error en login: ${error.message}`);
            res.status(500).json({ msg: "Error en login" });
        }
    },

    async signUp(req, res) {
        try {
            const { firstName, lastName, email, password, role } = req.body;

            if (!["administrador", "cliente"].includes(role)) {
                return res.status(400).json({ msg: "Rol inválido" });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ msg: "Email ya registrado" });
            }

            const hashedPassword = bcrypt.hashSync(password, Number.parseInt(authConfig.rounds));
            const user = await User.create({ firstName, lastName, email, password: hashedPassword });

            const roleDb = await Role.findOne({ where: { role } });
            await user.addRole(roleDb);

            logger.info(`Registro exitoso: ${email}`);
            res.status(201).json({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: roleDb.role
                }
            });

        } catch (error) {
            logger.error(`Error en registro: ${error.message}`);
            res.status(500).json({ msg: "Error al registrar usuario" });
        }
    }
};