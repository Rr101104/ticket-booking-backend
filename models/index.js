'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize'); // <-- must be here
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;

// If DATABASE_URL exists (Render/Railway/Heroku)
if (process.env.DATABASE_URL) {
  console.log("Using DATABASE_URL for Sequelize connection...");

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        // Many managed Postgres providers require this. For most hosted DBs it's fine
        // to set rejectUnauthorized: false. For stricter security replace with true and
        // provide CA certs.
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Local development uses config/config.json
  const config = require(__dirname + '/../config/config.json')[env];
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
