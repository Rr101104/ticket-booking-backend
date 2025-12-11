'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDING'
    });

    await queryInterface.addColumn('Bookings', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'expiresAt');
    await queryInterface.removeColumn('Bookings', 'status');
  }
};
