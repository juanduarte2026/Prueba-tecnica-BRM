'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { 
        role: "administrador", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        role: "cliente", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    
  }
};