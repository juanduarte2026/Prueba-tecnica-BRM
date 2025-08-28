'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PurchaseProduct extends Model {
    static associate(models) {
      PurchaseProduct.belongsTo(models.Purchase, {
        foreignKey: 'purchaseId'
      });
      
      PurchaseProduct.belongsTo(models.Product, {
        foreignKey: 'productId'
      });
    }
  }
  
  PurchaseProduct.init({
    purchaseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PurchaseProduct',
    tableName: 'purchaseProducts',
    timestamps: true
  });

  return PurchaseProduct;
};