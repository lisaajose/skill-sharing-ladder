// routes/progress.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/progress/user/:userId
// @desc    Get a user's progress across all learning skills
// @access  Private
router.get('/user/:userId', verifyToken, progressController.getUserProgress);

// @route   PUT /api/progress/:progressId
// @desc    Update a specific progress record
// @access  Private
router.put('/:progressId', verifyToken, progressController.updateProgress);

// Note: The checkAndAdvanceLadderLevel would likely be called internally
// after a session completion or skill verification, not as a direct API endpoint.

module.exports = router;