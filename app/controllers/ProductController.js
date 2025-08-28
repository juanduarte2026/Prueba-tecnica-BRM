const { Product, User } = require('../models/index');
const { Op } = require('sequelize');

module.exports = {

  async find(req, res, next) {
    try {
      let product = await Product.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }]
      });
      
      if (!product) {
        return res.status(404).json({ msg: "Producto no encontrado" });
      }
      req.product = product;
      next();
    } catch (error) {
      res.status(500).json({ msg: "Error al buscar producto", error: error.message });
    }
  },

  // Todos los productos (público para clientes y admins)
  async index(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      
      let whereCondition = {};
      if (search) {
        whereCondition = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { batchNumber: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const products = await Product.findAndCountAll({
        where: whereCondition,
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }],
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        products: products.rows,
        total: products.count,
        totalPages: Math.ceil(products.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener productos", error: error.message });
    }
  },

  // Productos de un usuario específico
  async userProducts(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      
      let whereCondition = { userId };
      if (search) {
        whereCondition = {
          userId,
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { batchNumber: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const products = await Product.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        products: products.rows,
        total: products.count,
        totalPages: Math.ceil(products.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener productos del usuario", error: error.message });
    }
  },

  async show(req, res) {
    try {
      res.json(req.product);
    } catch (error) {
      res.status(500).json({ msg: "Error al mostrar producto", error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { batchNumber, name, price, quantityAvailable } = req.body;
      const userId = req.user.id;
      
      const product = await Product.create({
        batchNumber,
        name,
        price: parseFloat(price),
        quantityAvailable: parseInt(quantityAvailable),
        userId: userId // Asignar el usuario que crea el producto
      });

      res.status(201).json({ msg: "Producto creado exitosamente", product });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ msg: "El número de lote ya existe" });
      }
      res.status(500).json({ msg: "Error al crear producto", error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { name, price, quantityAvailable } = req.body;
      
      req.product.name = name;
      req.product.price = parseFloat(price);
      req.product.quantityAvailable = parseInt(quantityAvailable);

      await req.product.save();

      res.json({ msg: "Producto actualizado exitosamente", product: req.product });
    } catch (error) {
      res.status(500).json({ msg: "Error al actualizar producto", error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await req.product.destroy();
      res.json({ msg: "Producto eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ msg: "Error al eliminar producto", error: error.message });
    }
  },

  async userProductShow(req, res) {
    try {
      const userId = req.user.id;
      const productId = req.params.id;

      const product = await Product.findOne({
        where: {
          id: productId,
          userId: userId
        },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }]
      });

      if (!product) {
        return res.status(404).json({ 
          msg: "Producto no encontrado en tu inventario" 
        });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ 
        msg: "Error al obtener el producto", 
        error: error.message 
      });
    }
  }

};