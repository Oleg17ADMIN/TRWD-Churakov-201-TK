// === routes/apiUserRoutes.js ===
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Отримати всіх користувачів
router.get('/', async (req, res) => {
  try {
    const users = await User.find().lean();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Створити користувача
router.post('/', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Валідація
    if (!name || !email || !password) {
      return res.status(401).json({ message: 'Всі поля обов\'язкові' });
    }

    // Перевірка унікальності email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: 'Користувач з таким email вже існує' });
    }

    const newUser = new User({ name, email, password, age });
    await newUser.save();

    res.status(201).json({ message: 'Користувач створений', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при створенні користувача' });
  }
});

// Оновити користувача
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Валідація
    if (!name || !email || !password) {
      return res.status(401).json({ message: 'Всі поля обов\'язкові' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, age },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.status(200).json({ message: 'Користувача оновлено', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при оновленні користувача' });
  }
});

// Видалити користувача
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.status(200).json({ message: 'Користувача видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при видаленні користувача' });
  }
});

module.exports = router;
