// controllers/matchController.js
const pool = require('../db');

// Helper to get user's current level
async function getUserLevel(userId) {
    const [[{ current_level }]] = await pool.query('SELECT current_level FROM Users WHERE user_id = ?', [userId]);
    return current_level;
}

// @route   GET /api/matches/suggestions/:userId
// @desc    Get match suggestions for a user based on ladder logic
// @access  Private
exports.getMatchSuggestions = async (req, res) => {
    const userId = req.params.userId;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to get suggestions for this user' });
    }

    try {
        const userLevel = await getUserLevel(userId);

        // 1. Find skills the user wants to learn (role = 'learn')
        const [learningInterests] = await pool.query(
            `SELECT us.skill_id, s.skill_name FROM UserSkills us
             JOIN Skills s ON us.skill_id = s.skill_id
             WHERE us.user_id = ? AND us.role = 'learn'`,
            [userId]
        );

        let potentialTeachers = [];
        if (learningInterests.length > 0) {
            const learningSkillIds = learningInterests.map(interest => interest.skill_id);
            // Find users who can teach these skills and are at an "adjacent" or higher level
            // Simple adjacency: teacher's level is same or +1 from learner's desired level for that skill
            [potentialTeachers] = await pool.query(
                `SELECT u.user_id as teacher_id, u.username as teacher_username,
                        s.skill_id, s.skill_name, us_teach.proficiency_level, u.current_level as teacher_level
                 FROM Users u
                 JOIN UserSkills us_teach ON u.user_id = us_teach.user_id AND us_teach.role = 'teach'
                 JOIN Skills s ON us_teach.skill_id = s.skill_id
                 WHERE us_teach.skill_id IN (?)
                   AND u.user_id != ?
                   AND u.current_level >= ? -- Teacher should be at least at the user's current level (or higher)
                 ORDER BY u.reputation DESC, u.current_level ASC
                 LIMIT 10`,
                [learningSkillIds, userId, userLevel]
            );
        }

        // 2. Find skills the user can teach (role = 'teach')
        const [teachingCapabilities] = await pool.query(
            `SELECT us.skill_id, s.skill_name FROM UserSkills us
             JOIN Skills s ON us.skill_id = s.skill_id
             WHERE us.user_id = ? AND us.role = 'teach' AND us.is_verified = TRUE`, // Only teach verified skills
            [userId]
        );

        let potentialLearners = [];
        if (teachingCapabilities.length > 0) {
            const teachingSkillIds = teachingCapabilities.map(capability => capability.skill_id);
            // Find users who want to learn these skills and are at an "adjacent" or lower level
            // Simple adjacency: learner's level is same or -1 from teacher's current level
            [potentialLearners] = await pool.query(
                `SELECT u.user_id as learner_id, u.username as learner_username,
                        s.skill_id, s.skill_name, u.current_level as learner_level
                 FROM Users u
                 JOIN UserSkills us_learn ON u.user_id = us_learn.user_id AND us_learn.role = 'learn'
                 JOIN Skills s ON us_learn.skill_id = s.skill_id
                 WHERE us_learn.skill_id IN (?)
                   AND u.user_id != ?
                   AND u.current_level <= ? -- Learner should be at most at the user's current level (or lower)
                 ORDER BY u.current_level DESC, u.reputation DESC
                 LIMIT 10`,
                [teachingSkillIds, userId, userLevel]
            );
        }

        res.json({
            userLevel,
            learningInterests,
            teachingCapabilities,
            potentialTeachers,
            potentialLearners
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error getting match suggestions');
    }
};

// @route   POST /api/matches
// @desc    Create a new match request
// @access  Private
exports.createMatch = async (req, res) => {
    const { teacher_user_id, learner_user_id, skill_id } = req.body;
    // Basic validation and authorization
    // A user can create a match request if they are either the teacher or the learner.
    if (req.user.id !== parseInt(learner_user_id) && req.user.id !== parseInt(teacher_user_id)) {
        return res.status(403).json({ message: 'Unauthorized to create this match' });
    }
    if (parseInt(teacher_user_id) === parseInt(learner_user_id)) {
        return res.status(400).json({ message: 'Cannot create a match with yourself.' });
    }

    try {
        // Check for existing pending/accepted match for the same skill between these two users
        const [existingMatch] = await pool.query(
            `SELECT * FROM Matches WHERE
            ((teacher_user_id = ? AND learner_user_id = ?) OR (teacher_user_id = ? AND learner_user_id = ?))
            AND skill_id = ? AND status IN ('pending', 'accepted')`,
            [teacher_user_id, learner_user_id, learner_user_id, teacher_user_id, skill_id]
        );

        if (existingMatch.length > 0) {
            return res.status(400).json({ message: 'An active match or pending request for this skill already exists between these users.' });
        }


        const [result] = await pool.query(
            'INSERT INTO Matches (teacher_user_id, learner_user_id, skill_id, status) VALUES (?, ?, ?, ?)',
            [teacher_user_id, learner_user_id, skill_id, 'pending']
        );
        res.status(201).json({ message: 'Match request created', match_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error creating match');
    }
};

// @route   GET /api/matches/user/:userId
// @desc    Get all active/pending matches for a user (as teacher or learner)
// @access  Private
exports.getUserMatches = async (req, res) => {
    const userId = req.params.userId;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to view these matches' });
    }
    try {
        const [matches] = await pool.query(
            `SELECT m.match_id,
                    t.username AS teacher_username,
                    l.username AS learner_username,
                    s.skill_name,
                    m.status,
                    m.created_at
             FROM Matches m
             JOIN Users t ON m.teacher_user_id = t.user_id
             JOIN Users l ON m.learner_user_id = l.user_id
             JOIN Skills s ON m.skill_id = s.skill_id
             WHERE m.teacher_user_id = ? OR m.learner_user_id = ?
             ORDER BY m.created_at DESC`,
            [userId, userId]
        );
        res.json(matches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching matches');
    }
};

// @route   PUT /api/matches/:matchId/status
// @desc    Update the status of a match (e.g., accept, complete, cancel)
// @access  Private
exports.updateMatchStatus = async (req, res) => {
    const matchId = req.params.matchId;
    const { status } = req.body; // 'accepted', 'completed', 'cancelled'

    if (!['accepted', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid match status provided.' });
    }

    try {
        // Get match details and check authorization
        const [match] = await pool.query('SELECT teacher_user_id, learner_user_id FROM Matches WHERE match_id = ?', [matchId]);
        if (match.length === 0) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Only the teacher or learner involved can update the match status
        if (req.user.id !== match[0].teacher_user_id && req.user.id !== match[0].learner_user_id) {
            return res.status(403).json({ message: 'Unauthorized to update this match status' });
        }

        const [result] = await pool.query(
            'UPDATE Matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE match_id = ?',
            [status, matchId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Match not found or no changes made' });
        }

        res.json({ message: `Match status updated to ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error updating match status');
    }
};