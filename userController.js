// === controllers/userController.js ===
const User = require('../models/user');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render('users', { title: 'Список користувачів', users });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Не вдалося завантажити користувачів' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Валідація введення
    if (!name || !email || !password) {
      return res.status(401).render('error', { message: 'Всі поля обов\'язкові' });
    }

    // Перевірка, чи вже існує користувач з таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).render('error', { message: 'Користувач з таким email вже існує' });
    }

    // Створюємо нового користувача
    const newUser = new User({ name, email, password, age });
    await newUser.save();

    req.flash('success_msg', 'Користувача додано');
    res.status(201).redirect('/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Не вдалося створити користувача' });
  }
};
