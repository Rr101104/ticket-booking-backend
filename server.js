// server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Routes
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/shows", showRoutes);
app.use("/bookings", bookingRoutes);

// import sequelize
const db = require("./models"); // this should export { sequelize, Sequelize, ... }

async function start() {
  try {
    console.log("Connecting to DB...");
    // sync will create tables if they don't exist.
    // In production you may prefer migrations; sync({ alter: true }) updates schema to match models.
    await db.sequelize.authenticate();
    // Use sync() or sync({ alter: true }) — choose alter if you want Sequelize to update columns.
    await db.sequelize.sync(); // safe default; change to { alter: true } if you want auto-alter
    console.log("DB connected and synced.");

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
