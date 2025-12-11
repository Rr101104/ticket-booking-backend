const { Show } = require("../models");

module.exports = {
  async getAllShows(req, res) {
    try {
      const shows = await Show.findAll();
      res.json(shows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createShow(req, res) {
    try {
      const { name, startTime, seats } = req.body;

      const newShow = await Show.create({
        name,
        startTime,
        seats,
      });

      res.json(newShow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
