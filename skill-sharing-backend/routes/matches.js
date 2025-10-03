// routes/matches.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/matches/suggestions/:userId
// @desc    Get match suggestions for a user
// @access  Private
router.get('/suggestions/:userId', verifyToken, matchController.getMatchSuggestions);

// @route   POST /api/matches
// @desc    Create a new match request
// @access  Private
router.post('/', verifyToken, matchController.createMatch);

// @route   GET /api/matches/user/:userId
// @desc    Get all active/pending matches for a user
// @access  Private
router.get('/user/:userId', verifyToken, matchController.getUserMatches);

// @route   PUT /api/matches/:matchId/status
// @desc    Update the status of a match (e.g., accept, complete, cancel)
// @access  Private
router.put('/:matchId/status', verifyToken, matchController.updateMatchStatus);

module.exports = router;