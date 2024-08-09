import express from 'express';

const health = express.Router();

health.get('/', (_, response) => {
  response.json({ status: 'ok' });
});

export default health;