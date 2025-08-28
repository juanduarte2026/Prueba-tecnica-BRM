const { Product, User } = require('../models/index');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

module.exports = {

  async find(req, res, next) {
    try {
      let product = await Product.findByPk(req.params.id);
      
      if (!product) {
        return res.status(404).json({ msg: "Producto no encontrado" });
      }
      req.product = product;
      next();
    } catch (error) {
      logger.error(`Error buscando producto: ${error.message}`);
      res.status(500).json({ msg: "Error al buscar producto" });
    }
  },

  // Todos los productos
  async index(req, res) {
    try {
      const { search } = req.query;
      
      let whereCondition = {};
      if (search) {
        whereCondition = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { batchNumber: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      const products = await Product.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        products: products,
        total: products.length
      });
    } catch (error) {
      logger.error(`Error obteniendo productos: ${error.message}`);
      res.status(500).json({ msg: "Error al obtener productos" });
    }
  },

  // Productos del usuario
  async userProducts(req, res) {
    try {
      const userId = req.user.id;

      const products = await Product.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        products: products,
        total: products.length
      });
    } catch (error) {
      logger.error(`Error obteniendo productos usuario: ${error.message}`);
      res.status(500).json({ msg: "Error al obtener productos" });
    }
  },

  async show(req, res) {
    res.json(req.product);
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
        userId
      });

      logger.info(`Producto creado: ${name} por usuario ${userId}`);
      res.status(201).json({ msg: "Producto creado", product });
    } catch (error) {
      logger.error(`Error creando producto: ${error.message}`);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ msg: "Número de lote ya existe" });
      }
      res.status(500).json({ msg: "Error al crear producto" });
    }
  },

  async update(req, res) {
    try {
      const { name, price, quantityAvailable } = req.body;
      
      await req.product.update({
        name,
        price: parseFloat(price),
        quantityAvailable: parseInt(quantityAvailable)
      });

      logger.info(`Producto actualizado: ${req.product.id}`);
      res.json({ msg: "Producto actualizado", product: req.product });
    } catch (error) {
      logger.error(`Error actualizando producto: ${error.message}`);
      res.status(500).json({ msg: "Error al actualizar producto" });
    }
  },

  async delete(req, res) {
    try {
      await req.product.destroy();
      logger.info(`Producto eliminado: ${req.product.id}`);
      res.json({ msg: "Producto eliminado" });
    } catch (error) {
      logger.error(`Error eliminando producto: ${error.message}`);
      res.status(500).json({ msg: "Error al eliminar producto" });
    }
  }

};