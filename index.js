// routes/index.js
const express = require('express');
const router = express.Router();

// Наприклад, у routes/index.js:
router.get('/', (req, res) => {
  // Просто рендеримо index.mustache,  передаємо тайтл та інформацію про користувача
  res.render('index', {
    title: 'Головна',
    user: req.user
  });
});

// Про проєкт → /about
router.get('/about', (req, res) => {
  res.render('about', { title: 'Про проєкт', user: req.user });
});

module.exports = router;
