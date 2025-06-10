const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth'); // Додано імпорт middleware

// Список усіх тестів
router.get('/', testController.getTests);

// Форма створення тесту
router.get('/new', authMiddleware, testController.newTestForm);

// Створення тесту (POST)
router.post('/', authMiddleware, testController.createTest);

// Форма редагування тесту
router.get('/:id/edit', authMiddleware, testController.editTestForm);

// Оновлення тесту (PUT)
router.put('/:id', authMiddleware, testController.updateTest);

// Деталі конкретного тесту
router.get('/:id', testController.getTest);

// Здати тест (POST)
router.post('/:id/submit', testController.submitTest);

// Створення запитання (POST)
router.post('/:testId/questions/create', authMiddleware, testController.createQuestion);

// Видалення тесту (DELETE)
router.delete('/:id', authMiddleware, testController.deleteTest);

module.exports = router;