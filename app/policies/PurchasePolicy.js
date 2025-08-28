module.exports = {
  // Solo clientes pueden realizar compras
  async create(req, res, next) {
    if (!req.user.roles.some(role => role.role === 'cliente')) {
      return res.status(403).json({ msg: "Solo los clientes pueden realizar compras" });
    }
    next();
  },

  // Solo administradores pueden ver todas las compras
  async getAll(req, res, next) {
    if (!req.user.roles.some(role => role.role === 'administrador')) {
      return res.status(403).json({ msg: "No autorizado" });
    }
    next();
  }
};