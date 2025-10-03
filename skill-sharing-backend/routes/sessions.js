// routes/sessions.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const verifyToken = require('../middleware/authMiddleware');

// @route   POST /api/sessions
// @desc    Schedule a new session for an existing match
// @access  Private
router.post('/', verifyToken, sessionController.createSession);

// @route   PUT /api/sessions/:id/complete
// @desc    Mark a session as complete and add feedback
// @access  Private
router.put('/:id/complete', verifyToken, sessionController.completeSession);

// @route   GET /api/sessions/user/:userId
// @desc    Get all sessions for a user (as teacher or learner)
// @access  Private
router.get('/user/:userId', verifyToken, sessionController.getUserSessions);

module.exports = router;