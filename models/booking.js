"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // define relationships here later (if needed)
      // Example: Booking.belongsTo(models.User);
    }
  }

  Booking.init(
    {
      movieName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "CONFIRMED"
},
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
},

      showTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "Bookings",
    }
  );

  return Booking;
};
