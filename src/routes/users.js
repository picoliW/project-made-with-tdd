const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/', (req, res) => {
    app.services.user.findAll().then((result) => res.status(200).json(result));
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.user.save(req.body);
      return res.status(201).json(result[0]);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
