const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', authController.registerForm);
router.post('/register', express.urlencoded({ extended: true }), authController.register);

router.get('/login', authController.loginForm);
router.post('/login', express.urlencoded({ extended: true }), authController.login);

router.get('/logout', authController.logout);

module.exports = router;