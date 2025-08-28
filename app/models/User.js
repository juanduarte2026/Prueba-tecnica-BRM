'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { as: "posts", foreignKey: "userId"})
      User.belongsToMany(models.Role, {as: "roles", through: "user_role", foreignKey: "user_id"})
    }
  }
  
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[a-zA-Z\s]+$/,
          msg: "El nombre solo permite letras y espacios"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[a-zA-Z\s]+$/,
          msg: "El apellido solo permite letras y espacios"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    // Sequelize automáticamente maneja timestamps, pero si quieres control explícito:
    timestamps: true
  });

User.isAdministrador = function(userRoles) {
    // Verificar si userRoles es un array válido
    if (!userRoles || !Array.isArray(userRoles)) {
        return false;
    }

    return userRoles.some(role => {
        return role.role === 'administrador';
    });
}
  
  return User;
};