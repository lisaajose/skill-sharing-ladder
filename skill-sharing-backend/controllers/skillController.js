// controllers/skillController.js
const pool = require('../db');

// @route   GET /api/skills
// @desc    Get all available skills
// @access  Private
exports.getAllSkills = async (req, res) => {
    try {
        const [skills] = await pool.query('SELECT * FROM Skills');
        res.json(skills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/skills
// @desc    Add a new skill (admin/expert functionality)
// @access  Private (requires admin role, not yet implemented)
exports.addSkill = async (req, res) => {
    const { skill_name, description } = req.body;
    // Basic authorization - only allow if user is an admin or trusted
    // For now, let any authenticated user add, but ideally restricted.
    try {
        const [result] = await pool.query('INSERT INTO Skills (skill_name, description) VALUES (?, ?)', [skill_name, description]);
        res.status(201).json({ message: 'Skill added', skill_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/skills/user/:userId
// @desc    Get skills a user teaches/learns
// @access  Private
exports.getUserSkills = async (req, res) => {
    try {
        const [userSkills] = await pool.query(
            `SELECT us.user_skill_id, s.skill_id, s.skill_name, us.role, us.proficiency_level, us.is_verified
             FROM UserSkills us
             JOIN Skills s ON us.skill_id = s.skill_id
             WHERE us.user_id = ?`,
            [req.params.userId]
        );
        res.json(userSkills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/skills/user
// @desc    Add a skill for a user (teach/learn role)
// @access  Private
exports.addUserSkill = async (req, res) => {
    const { user_id, skill_id, role, proficiency_level } = req.body;
    // Authorization: req.user.id should match user_id
    if (req.user.id !== parseInt(user_id)) {
        return res.status(403).json({ message: 'Unauthorized to add skill for this user' });
    }
    try {
        // Check if user already has this skill with this role
        const [existing] = await pool.query(
            'SELECT * FROM UserSkills WHERE user_id = ? AND skill_id = ? AND role = ?',
            [user_id, skill_id, role]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: `User already has this skill as a ${role}` });
        }

        const [result] = await pool.query(
            'INSERT INTO UserSkills (user_id, skill_id, role, proficiency_level) VALUES (?, ?, ?, ?)',
            [user_id, skill_id, role, proficiency_level || 0] // Default proficiency to 0 if not provided
        );
        res.status(201).json({ message: 'User skill added', user_skill_id: result.insertId });

        // If the user adds a skill to 'learn', also create a progress entry for it
        if (role === 'learn') {
            await pool.query(
                'INSERT IGNORE INTO Progress (user_id, skill_id) VALUES (?, ?)',
                [user_id, skill_id]
            );
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   DELETE /api/skills/user/:userSkillId
// @desc    Remove a skill from a user's teach/learn list
// @access  Private
exports.removeUserSkill = async (req, res) => {
    const userSkillId = req.params.userSkillId;

    try {
        // Get user_id from user_skill_id for authorization
        const [userSkill] = await pool.query('SELECT user_id, skill_id, role FROM UserSkills WHERE user_skill_id = ?', [userSkillId]);
        if (userSkill.length === 0) {
            return res.status(404).json({ message: 'User skill entry not found' });
        }

        // Authorization
        if (req.user.id !== userSkill[0].user_id) {
            return res.status(403).json({ message: 'Unauthorized to remove this user skill' });
        }

        const [result] = await pool.query('DELETE FROM UserSkills WHERE user_skill_id = ?', [userSkillId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User skill not found or already removed' });
        }

        // If the removed skill was for learning, consider removing its progress entry too
        if (userSkill[0].role === 'learn') {
            await pool.query(
                'DELETE FROM Progress WHERE user_id = ? AND skill_id = ?',
                [userSkill[0].user_id, userSkill[0].skill_id]
            );
        }

        res.json({ message: 'User skill removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error removing user skill');
    }
};