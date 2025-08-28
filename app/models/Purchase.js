'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      Purchase.belongsToMany(models.Product, {
        through: models.PurchaseProduct,
        foreignKey: 'purchaseId',
        as: 'products'
      });
    }
  }
  
  Purchase.init({
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: true
  });

  return Purchase;
};