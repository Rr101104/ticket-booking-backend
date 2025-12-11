// controllers/bookingController.js
const db = require("../models");
const { Booking, Show, sequelize } = db;
const { Transaction, Op } = require("sequelize");

module.exports = {
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.findAll({ order: [["id", "ASC"]] });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async createBooking(req, res) {
    const t = await sequelize.transaction();
    try {
      const { showId, userName, numberOfSeats } = req.body || {};
      if (!showId || !userName || !numberOfSeats) {
        await t.rollback();
        return res.status(400).json({ error: "showId, userName and numberOfSeats are required" });
      }

      const seatsRequested = Number(numberOfSeats);
      if (isNaN(seatsRequested) || seatsRequested <= 0) {
        await t.rollback();
        return res.status(400).json({ error: "numberOfSeats must be a positive number" });
      }

      // Lock show row
      const show = await Show.findByPk(showId, { transaction: t, lock: Transaction.LOCK.UPDATE });
      if (!show) {
        await t.rollback();
        return res.status(404).json({ error: "Show not found" });
      }

      if (show.seats < seatsRequested) {
        await t.rollback();
        return res.status(409).json({ error: "Not enough seats available" });
      }

      // Reserve seats
      show.seats = show.seats - seatsRequested;
      await show.save({ transaction: t });

      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

      const bookingPayload = {
        movieName: show.name || "Unknown",
        userName,
        seats: seatsRequested,
        showTime: show.startTime ? show.startTime.toString() : "",
        status: "PENDING",
        expiresAt
      };

      const newBooking = await Booking.create(bookingPayload, { transaction: t });

      await t.commit();
      return res.status(201).json(newBooking);
    } catch (error) {
      try { await t.rollback(); } catch (e) {}
      console.error("createBooking error:", error);
      return res.status(500).json({ error: error.message });
    }
  },


  async confirmBooking(req, res) {
    const t = await sequelize.transaction();
    try {
      const bookingId = Number(req.params.id);
      if (!bookingId) {
        return res.status(400).json({ error: "Booking id required" });
      }

      const booking = await Booking.findByPk(bookingId, { transaction: t, lock: Transaction.LOCK.UPDATE });
      if (!booking) {
        await t.rollback();
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "PENDING") {
        await t.rollback();
        return res.status(400).json({ error: `Booking is ${booking.status} and cannot be confirmed` });
      }

      booking.status = "CONFIRMED";
      booking.expiresAt = null;
      await booking.save({ transaction: t });

      await t.commit();
      return res.json(booking);
    } catch (error) {
      try { await t.rollback(); } catch (e) {}
      console.error("confirmBooking error:", error);
      return res.status(500).json({ error: error.message });
    }
  },


  async expirePendingBookings() {
    const now = new Date();
    // Find pending bookings that expired
    const expired = await Booking.findAll({
      where: {
        status: "PENDING",
        expiresAt: { [Op.lte]: now }
      }
    });

    for (const b of expired) {
      const t = await sequelize.transaction();
      try {
        // lock show row
        const show = await Show.findOne({ where: { name: b.movieName }, transaction: t, lock: Transaction.LOCK.UPDATE });
        if (!show) {
          // If show not found just mark FAILED
          b.status = "FAILED";
          b.expiresAt = null;
          await b.save({ transaction: t });
          await t.commit();
          continue;
        }

        // restore seats
        show.seats = show.seats + b.seats;
        await show.save({ transaction: t });

        // mark booking failed
        b.status = "FAILED";
        b.expiresAt = null;
        await b.save({ transaction: t });

        await t.commit();
        console.log(`Expired booking ${b.id} -> FAILED, restored ${b.seats} seats to show ${show.id}`);
      } catch (err) {
        console.error("Error expiring booking", b.id, err);
        try { await t.rollback(); } catch (e) {}
      }
    }
  }
};
