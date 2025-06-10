const express = require('express');
const router = express.Router();
const Test = require('../../models/Test');
const { check, validationResult } = require('express-validator');

// Middleware для логування API запитів
router.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl} ${new Date().toISOString()}`);
  next();
});

// Валідація тесту
const validateTest = [
  check('title').notEmpty().withMessage('Назва тесту обов\'язкова'),
  check('description').optional(),
  check('timeLimit').isInt({ min: 0 }).withMessage('Ліміт часу має бути додатнім числом')
];

// Отримати всі тести (GET /api/tests)
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    console.error('Помилка отримання тестів:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Отримати тест по ID (GET /api/tests/:id)
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Тест не знайдено' });
    }
    res.json(test);
  } catch (err) {
    console.error('Помилка отримання тесту:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Створити новий тест (POST /api/tests)
router.post('/', validateTest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, timeLimit } = req.body;
    const newTest = new Test({ title, description, timeLimit });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    console.error('Помилка створення тесту:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Оновити тест (PUT /api/tests/:id)
router.put('/:id', validateTest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, timeLimit } = req.body;
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { title, description, timeLimit },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ error: 'Тест не знайдено' });
    }

    res.json(test);
  } catch (err) {
    console.error('Помилка оновлення тесту:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Видалити тест (DELETE /api/tests/:id)
router.delete('/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Тест не знайдено' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Помилка видалення тесту:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;