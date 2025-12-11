"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Show extends Model {
    static associate(models) {
      // relationships can be added later
    }
  }

  Show.init(
    {
      name: DataTypes.STRING,
      startTime: DataTypes.DATE,
      seats: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Show",
      tableName: "Shows",
    }
  );

  return Show;
};
