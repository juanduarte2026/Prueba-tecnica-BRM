'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Purchase, {
        through: models.PurchaseProduct,
        foreignKey: 'productId',
        as: 'purchases'
      });
      
      Product.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'creator'
      });
    }
  }
  
  Product.init({
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El número de lote es requerido" }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es requerido" }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "El precio debe ser un número decimal" },
        min: { args: [0], msg: "El precio no puede ser negativo" }
      }
    },
    quantityAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "La cantidad debe ser un número entero" },
        min: { args: [0], msg: "La cantidad no puede ser negativa" }
      }
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  });

  return Product;
};