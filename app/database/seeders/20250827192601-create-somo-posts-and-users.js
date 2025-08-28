'use strict';

const { User } = require('../../models/index')
const bcrypt = require('bcrypt')
const authConfig = require('../../../config/auth')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up (queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    await Promise.all([
      User.create({
        firstName: "pepi",
        lastName: "Albert",
        email: "juanduarte10@gmail.com",
        password: bcrypt.hashSync("1234", +authConfig.rounds),
        posts: [
          {
            title: "Title 1",
            body: "Body 1"
          },
          {
            title: "Title 2",
            body: "Body 2"
          },
        ]
      }, {
        include: "posts",
        transaction
      }),

      User.create({
        firstName: "Lucia",
        lastName: "Albert",
        email: "juanduarte2@gmail.com",
        password: bcrypt.hashSync("1234", +authConfig.rounds),
        posts: [
          {
            title: "Title 3",
            body: "Body 3"
          },
          {
            title: "Title 4",
            body: "Body 4"
          },
        ]
      }, {
        include: "posts",
        transaction
      })
    ]);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
},

  async down (queryInterface, Sequelize) {

    return Promise.all([
      queryInterface.bulkDelete('posts', null, {}),
      queryInterface.bulkDelete('Users', null, {})
    ])

  }
};
