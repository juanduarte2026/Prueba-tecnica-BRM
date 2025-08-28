const { Purchase, Product, PurchaseProduct, User } = require('../models/index');
const { Op } = require('sequelize');
const logger = require('../utils/logger'); 

module.exports = {

  async create(req, res) {
    try {
      logger.info('Iniciando proceso de compra...');
      
      const { products } = req.body;
      const userId = req.user.id;


      if (!products || !Array.isArray(products) || products.length === 0) {
        logger.warn('Intento de compra sin productos');
        return res.status(400).json({ msg: "Debe agregar al menos un producto" });
      }

      let total = 0;
      const purchaseProducts = [];

      for (const item of products) {
        const product = await Product.findByPk(item.productId);
        
        if (!product) {
          logger.warn(`Producto con ID ${item.productId} no encontrado`);
          return res.status(404).json({ msg: `Producto con ID ${item.productId} no encontrado` });
        }

        if (product.quantityAvailable < item.quantity) {
          logger.warn(`Stock insuficiente para producto: ${product.name}`);
          return res.status(400).json({ 
            msg: `Stock insuficiente para el producto: ${product.name}. Disponible: ${product.quantityAvailable}` 
          });
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;

        purchaseProducts.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: subtotal
        });
      }

      logger.info('Creando compra...');
      const purchase = await Purchase.create({
        total: total,
        purchaseDate: new Date(),
        userId: userId
      });

      logger.info(`Compra creada ID: ${purchase.id}`);
      
      for (const item of purchaseProducts) {
        logger.info(`Agregando producto a compra: ${item.productId}`);
        
        await PurchaseProduct.create({
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        });

        const product = await Product.findByPk(item.productId);
        product.quantityAvailable -= item.quantity;
        await product.save();
        
        logger.info(`Stock actualizado para producto: ${item.productId}`);
      }

      // Obtener la compra completa con sus relaciones
      const completePurchase = await Purchase.findByPk(purchase.id, {
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity', 'unitPrice'] }
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      logger.info(`Compra ${purchase.id} completada exitosamente`);
      res.status(201).json({ 
        msg: "Compra realizada exitosamente", 
        purchase: completePurchase 
      });

    } catch (error) {
      logger.error(`Error en compra: ${error.message}`, { stack: error.stack });
      res.status(500).json({ 
        msg: "Error al realizar la compra", 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  },

  async userPurchases(req, res) {
    try {
      const userId = req.user.id;

      const purchases = await Purchase.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity', 'unitPrice'] }
          }
        ],
        order: [['purchaseDate', 'DESC']]
      });

      logger.info(`Obteniendo historial de compras para usuario: ${userId}`);
      res.json({
        purchases: purchases,
        total: purchases.length
      });
    } catch (error) {
      logger.error(`Error obteniendo historial de compras: ${error.message}`);
      res.status(500).json({ msg: "Error al obtener historial de compras", error: error.message });
    }
  },

  async getInvoice(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const purchase = await Purchase.findOne({
        where: { 
          id,
          userId
        },
        attributes: ['id', 'total', 'purchaseDate', 'createdAt'],
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id', 'batchNumber', 'name', 'price'],
            through: { 
              attributes: ['quantity', 'unitPrice'] 
            }
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!purchase) {
        logger.warn(`Factura no encontrada: ${id} para usuario: ${userId}`);
        return res.status(404).json({ msg: "Factura no encontrada" });
      }

      logger.info(`Factura obtenida: ${id}`);
      res.json({ purchase });
    } catch (error) {
      logger.error(`Error obteniendo factura: ${error.message}`);
      res.status(500).json({ msg: "Error al obtener factura", error: error.message });
    }
  },


  async getAllPurchases(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let whereCondition = {};
      if (startDate && endDate) {
        whereCondition.purchaseDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const purchases = await Purchase.findAll({
        where: whereCondition,
        attributes: ['id', 'total', 'purchaseDate', 'createdAt'],
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id', 'batchNumber', 'name', 'price'],
            through: { 
              attributes: ['quantity', 'unitPrice'] 
            }
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['purchaseDate', 'DESC']]
      });

      logger.info('Obteniendo todas las compras (admin)');
      res.json({
        purchases: purchases,
        total: purchases.length
      });
    } catch (error) {
      logger.error(`Error obteniendo compras (admin): ${error.message}`);
      res.status(500).json({ msg: "Error al obtener compras", error: error.message });
    }
  }
};