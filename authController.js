const passport = require('passport');
const User = require('../models/user');

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Реєстрація' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;
    const newUser = new User({ name, email, password, age });
    await newUser.save();
    req.flash('success_msg', 'Реєстрацію пройдено успішно. Тепер увійдіть.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error_msg', 'Помилка реєстрації. Спробуйте знову.');
    res.redirect('/register');
  }
};

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Вхід' });
};

exports.login = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};