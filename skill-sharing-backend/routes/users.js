// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', verifyToken, userController.getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', verifyToken, userController.updateUserProfile);

// @route   GET /api/users/:id/dashboard
// @desc    Get dashboard summary for a user
// @access  Private
router.get('/:id/dashboard', verifyToken, userController.getUserDashboard);

module.exports = router;