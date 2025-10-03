// controllers/userController.js
const pool = require('../db');

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT user_id, username, email, current_level, reputation FROM Users WHERE user_id = ?', [req.params.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (only owner can update)
exports.updateUserProfile = async (req, res) => {
    const { username, email } = req.body; // Can add more fields like skills later
    const userId = req.params.id;

    // Optional: Add authorization check here if req.user.id !== userId
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Users SET username = ?, email = ? WHERE user_id = ?',
            [username, email, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/users/:id/dashboard
// @desc    Get dashboard summary for a user
// @access  Private
exports.getUserDashboard = async (req, res) => {
    const userId = req.params.id;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to view this dashboard' });
    }
    try {
        const [[user]] = await pool.query('SELECT username, current_level, reputation FROM Users WHERE user_id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [teachingSkills] = await pool.query(
            `SELECT s.skill_name, us.proficiency_level FROM UserSkills us
             JOIN Skills s ON us.skill_id = s.skill_id
             WHERE us.user_id = ? AND us.role = 'teach'`, [userId]
        );

        const [learningSkills] = await pool.query(
            `SELECT s.skill_name, p.completion_percentage FROM Progress p
             JOIN Skills s ON p.skill_id = s.skill_id
             WHERE p.user_id = ?`, [userId]
        );

        const [pendingMatches] = await pool.query(
            `SELECT m.match_id, s.skill_name, u_teacher.username AS teacher, u_learner.username AS learner, m.status
             FROM Matches m
             JOIN Skills s ON m.skill_id = s.skill_id
             JOIN Users u_teacher ON m.teacher_user_id = u_teacher.user_id
             JOIN Users u_learner ON m.learner_user_id = u_learner.user_id
             WHERE (m.teacher_user_id = ? OR m.learner_user_id = ?) AND m.status = 'pending'`, [userId, userId]
        );

        res.json({
            user: {
                username: user.username,
                current_level: user.current_level,
                reputation: user.reputation,
            },
            teachingSkills,
            learningSkills,
            pendingMatches
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching dashboard data');
    }
};