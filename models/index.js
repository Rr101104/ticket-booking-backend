// If DATABASE_URL exists (Render/Railway/Heroku)
if (process.env.DATABASE_URL) {
  console.log("Using DATABASE_URL for Sequelize connection...");

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        // For many cloud providers (Render, Railway, Heroku) you need this.
        // In production you would ideally validate certs, but for typical managed DBs set to false.
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
