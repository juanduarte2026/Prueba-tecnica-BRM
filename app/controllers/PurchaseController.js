const { Purchase, Product, PurchaseProduct, User } = require('../models/index');
const { Op } = require('sequelize');

module.exports = {

async create(req, res) {
  try {
    console.log('Iniciando proceso de compra...');
    
    const { products } = req.body;
    const userId = req.user.id;

    // Validar que hay productos
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: "Debe agregar al menos un producto" });
    }

    let total = 0;
    const purchaseProducts = [];

    // Verificar stock y calcular total
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        return res.status(404).json({ msg: `Producto con ID ${item.productId} no encontrado` });
      }

      if (product.quantityAvailable < item.quantity) {
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

    console.log('Creando compra...');
    // Crear la compra
    const purchase = await Purchase.create({
      total: total,
      purchaseDate: new Date(),
      userId: userId
    });

    console.log('Compra creada ID:', purchase.id);
    
    // Crear los productos de la compra y actualizar stock
    for (const item of purchaseProducts) {
      console.log('Agregando producto a compra:', item.productId);
      
      await PurchaseProduct.create({
        purchaseId: purchase.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });

      // Actualizar stock del producto
      const product = await Product.findByPk(item.productId);
      product.quantityAvailable -= item.quantity;
      await product.save();
      
      console.log('Stock actualizado para producto:', item.productId);
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

    res.status(201).json({ 
      msg: "Compra realizada exitosamente", 
      purchase: completePurchase 
    });

  } catch (error) {
    console.error('Error completo en compra:', error);
    res.status(500).json({ 
      msg: "Error al realizar la compra", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
},

  // Obtener historial de compras del cliente
  async userPurchases(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const purchases = await Purchase.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity', 'unitPrice'] }
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['purchaseDate', 'DESC']]
      });

      res.json({
        purchases: purchases.rows,
        total: purchases.count,
        totalPages: Math.ceil(purchases.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener historial de compras", error: error.message });
    }
  },

  // Obtener factura específica
async getInvoice(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findOne({
      where: { 
        id,
        userId
      },
      attributes: ['id', 'total', 'purchaseDate', 'createdAt'], // Solo estos campos de Purchase
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'batchNumber', 'name', 'price'], // Solo estos campos de Product
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
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    res.json({ purchase });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener factura", error: error.message });
  }
},

// Administrador: obtener todas las compras
async getAllPurchases(req, res) {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (startDate && endDate) {
      whereCondition.purchaseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const purchases = await Purchase.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'total', 'purchaseDate', 'createdAt'], // Campos específicos de Purchase
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'batchNumber', 'name', 'price'], // Campos específicos de Product
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
      limit: parseInt(limit),
      offset: offset,
      order: [['purchaseDate', 'DESC']]
    });

    res.json({
      purchases: purchases.rows,
      total: purchases.count,
      totalPages: Math.ceil(purchases.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener compras", error: error.message });
  }
}
};