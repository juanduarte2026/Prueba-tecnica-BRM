module.exports = {
 
  async show(req, res, next) {
    next(); 
  },

  // Solo administradores pueden crear productos
  async create(req, res, next) {
    if (!req.user.roles.some(role => role.role === 'administrador')) {
      return res.status(403).json({ msg: "Solo administradores pueden crear productos" });
    }
    next();
  },

 
  async update(req, res, next) {
    const isCreator = req.product.userId === req.user.id;
    
    if (!isCreator) {
      return res.status(403).json({ 
        msg: "No autorizado. Solo el creador del producto puede editarlo." 
      });
    }
    next();
  },

  // SOLO el creador del producto puede eliminar
  async delete(req, res, next) {
    const isCreator = req.product.userId === req.user.id;
    
    if (!isCreator) {
      return res.status(403).json({ 
        msg: "No autorizado. Solo el creador del producto puede eliminarlo." 
      });
    }
    next();
  },

  // Solo administradores pueden ver todos los productos 
  async adminOnly(req, res, next) {
    if (!req.user.roles.some(role => role.role === 'administrador')) {
      return res.status(403).json({ msg: "No autorizado" });
    }
    next();
  },

  // Verificar que el producto pertenece al usuario
  async userProductAccess(req, res, next) {
    const isCreator = req.product.userId === req.user.id;
    
    if (!isCreator) {
      return res.status(403).json({ 
        msg: "No autorizado. Este producto no pertenece a tu inventario." 
      });
    }
    next();
  }
};