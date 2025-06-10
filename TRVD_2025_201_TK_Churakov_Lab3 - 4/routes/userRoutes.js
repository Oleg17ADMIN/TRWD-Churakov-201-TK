// === routes/userRoutes.js ===
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// /users
router.get('/', authMiddleware, userController.getUsers);
router.post('/', authMiddleware, express.urlencoded({ extended: true }), userController.createUser);

module.exports = router;
