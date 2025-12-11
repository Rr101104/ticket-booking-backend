const express = require("express");
const app = express();
const PORT = 5000;

app.use(express.json());

// Health check route (fix for "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Ticket Booking Backend is running");
});

// Routes
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/shows", showRoutes);
app.use("/bookings", bookingRoutes);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
const bookingController = require("./controllers/bookingController");

// start periodic expiry worker (runs every 30 seconds)
setInterval(() => {
  bookingController.expirePendingBookings().catch(err => {
    console.error("expirePendingBookings error:", err);
  });
}, 30 * 1000);
