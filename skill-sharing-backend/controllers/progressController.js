// controllers/progressController.js
const pool = require('../db');

// @route   GET /api/progress/user/:userId
// @desc    Get a user's progress across all learning skills
// @access  Private
exports.getUserProgress = async (req, res) => {
    const userId = req.params.userId;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to view this user\'s progress' });
    }
    try {
        const [progressRecords] = await pool.query(
            `SELECT p.progress_id, s.skill_name, p.current_stage, p.completion_percentage,
                    p.sessions_completed, p.required_sessions_to_advance, p.can_advance_ladder
             FROM Progress p
             JOIN Skills s ON p.skill_id = s.skill_id
             WHERE p.user_id = ?
             ORDER BY s.skill_name`,
            [userId]
        );
        res.json(progressRecords);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching user progress');
    }
};

// @route   PUT /api/progress/:progressId
// @desc    Update a specific progress record (e.g., mark stage complete, update percentage)
// @access  Private (only owner or expert can update)
exports.updateProgress = async (req, res) => {
    const progressId = req.params.progressId;
    const { current_stage, completion_percentage } = req.body;

    try {
        // Get progress record details for authorization
        const [progress] = await pool.query('SELECT user_id, skill_id FROM Progress WHERE progress_id = ?', [progressId]);
        if (progress.length === 0) {
            return res.status(404).json({ message: 'Progress record not found' });
        }

        // Authorization: Only the owner of the progress record can update it (or an expert later)
        if (req.user.id !== progress[0].user_id) {
            return res.status(403).json({ message: 'Unauthorized to update this progress record' });
        }

        const [result] = await pool.query(
            `UPDATE Progress SET current_stage = COALESCE(?, current_stage),
                                 completion_percentage = COALESCE(?, completion_percentage),
                                 updated_at = CURRENT_TIMESTAMP
             WHERE progress_id = ?`,
            [current_stage, completion_percentage, progressId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Progress record not found or no changes made' });
        }

        res.json({ message: 'Progress updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error updating progress');
    }
};

// Placeholder for a function to check and update ladder level
// This would be called after significant progress or verification
exports.checkAndAdvanceLadderLevel = async (userId) => {
    // Implement complex logic here:
    // 1. Get all 'learning' skills for the user and their progress.
    // 2. Determine if enough skills are completed/verified to move to the next level.
    // 3. Update the Users.current_level if criteria met.
    // 4. Also check if enough 'teaching' contributions are met.
    try {
        const [[user]] = await pool.query('SELECT current_level, reputation FROM Users WHERE user_id = ?', [userId]);
        if (!user) {
            console.warn(`User ${userId} not found for ladder advancement check.`);
            return;
        }

        // Example simple rule: Advance if reputation > 100 * current_level and completed 2 skills.
        const [completedSkillsCount] = await pool.query(
            `SELECT COUNT(*) AS count FROM Progress
             WHERE user_id = ? AND completion_percentage = 100`,
            [userId]
        );

        const currentLevel = user.current_level;
        const reputationThreshold = 100 * currentLevel; // E.g., Level 1 -> 100 rep, Level 2 -> 200 rep
        const skillsNeededToAdvance = 2 * currentLevel; // E.g., Level 1 -> 2 skills, Level 2 -> 4 skills

        if (user.reputation >= reputationThreshold && completedSkillsCount[0].count >= skillsNeededToAdvance) {
            const newLevel = currentLevel + 1;
            await pool.query('UPDATE Users SET current_level = ? WHERE user_id = ?', [newLevel, userId]);
            console.log(`User ${userId} advanced to Level ${newLevel}!`);
            return true; // Indicate advancement
        }
        return false; // No advancement
    } catch (err) {
        console.error('Error in checkAndAdvanceLadderLevel:', err.message);
        return false;
    }
};