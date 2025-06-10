// routes/result.js
const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/auth');

// Захищаємо маршрут, щоб лише авторизовані бачили
router.get('/my-results', authMiddleware, resultController.myResults);

module.exports = router;
