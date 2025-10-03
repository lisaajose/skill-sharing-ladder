// routes/skills.js
const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/skills
// @desc    Get all available skills
// @access  Private
router.get('/', verifyToken, skillController.getAllSkills);

// @route   POST /api/skills
// @desc    Add a new skill (requires admin/expert role eventually)
// @access  Private
router.post('/', verifyToken, skillController.addSkill);

// @route   GET /api/skills/user/:userId
// @desc    Get skills a user teaches/learns
// @access  Private
router.get('/user/:userId', verifyToken, skillController.getUserSkills);

// @route   POST /api/skills/user
// @desc    Add a skill for a user (teach/learn role)
// @access  Private
router.post('/user', verifyToken, skillController.addUserSkill);

// @route   DELETE /api/skills/user/:userSkillId
// @desc    Remove a skill from a user's teach/learn list
// @access  Private
router.delete('/user/:userSkillId', verifyToken, skillController.removeUserSkill);

module.exports = router;