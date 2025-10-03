// controllers/sessionController.js
const pool = require('../db');

// @route   POST /api/sessions
// @desc    Schedule a new session for an existing match
// @access  Private
exports.createSession = async (req, res) => {
    const { match_id, session_date, duration_minutes, notes } = req.body;
    // Authorization: Check if the user is part of the match_id
    try {
        const [match] = await pool.query('SELECT teacher_user_id, learner_user_id FROM Matches WHERE match_id = ?', [match_id]);
        if (match.length === 0) {
            return res.status(404).json({ message: 'Match not found for this session.' });
        }

        // Only teacher or learner can schedule a session for their match
        if (req.user.id !== match[0].teacher_user_id && req.user.id !== match[0].learner_user_id) {
            return res.status(403).json({ message: 'Unauthorized to schedule session for this match.' });
        }

        // Ensure the match is 'accepted' before scheduling sessions
        const [[matchStatus]] = await pool.query('SELECT status FROM Matches WHERE match_id = ?', [match_id]);
        if (matchStatus.status !== 'accepted') {
            return res.status(400).json({ message: 'Sessions can only be scheduled for accepted matches.' });
        }

        const [result] = await pool.query(
            'INSERT INTO Sessions (match_id, session_date, duration_minutes, notes, status) VALUES (?, ?, ?, ?, ?)',
            [match_id, session_date, duration_minutes, notes, 'scheduled']
        );
        res.status(201).json({ message: 'Session scheduled', session_id: result.insertId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error scheduling session');
    }
};

// @route   PUT /api/sessions/:id/complete
// @desc    Mark a session as complete and add feedback
// @access  Private
exports.completeSession = async (req, res) => {
    const sessionId = req.params.id;
    const { teacher_feedback_rating, learner_feedback_rating, notes } = req.body; // Learner gives teacher_feedback, teacher gives learner_feedback

    try {
        // Fetch match details to determine who is teacher/learner to apply feedback correctly
        // And ensure the user completing the session is authorized
        const [sessionInfo] = await pool.query(
            `SELECT s.match_id, m.teacher_user_id, m.learner_user_id, m.skill_id
             FROM Sessions s JOIN Matches m ON s.match_id = m.match_id
             WHERE s.session_id = ?`,
            [sessionId]
        );

        if (sessionInfo.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const match = sessionInfo[0];
        // Authorization: Only the teacher or learner of the match can complete/feedback a session
        if (req.user.id !== match.teacher_user_id && req.user.id !== match.learner_user_id) {
            return res.status(403).json({ message: 'Unauthorized to complete this session' });
        }

        const [result] = await pool.query(
            `UPDATE Sessions SET status = 'completed',
                                teacher_feedback_rating = COALESCE(?, teacher_feedback_rating),
                                learner_feedback_rating = COALESCE(?, learner_feedback_rating),
                                notes = COALESCE(?, notes),
                                updated_at = CURRENT_TIMESTAMP
             WHERE session_id = ?`,
            [teacher_feedback_rating, learner_feedback_rating, notes, sessionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Session not found or no changes made' });
        }

        // --- Logic to update user reputation and skill progress ---
        // Update teacher's reputation based on learner feedback
        if (teacher_feedback_rating) {
            await pool.query('UPDATE Users SET reputation = reputation + ? WHERE user_id = ?', [teacher_feedback_rating, match.teacher_user_id]);
        }
        // Update learner's reputation based on teacher feedback (optional, or specific criteria)
        if (learner_feedback_rating) {
             await pool.query('UPDATE Users SET reputation = reputation + ? WHERE user_id = ?', [learner_feedback_rating, match.learner_user_id]);
        }


        // Update progress for the learner
        await pool.query(
            `INSERT INTO Progress (user_id, skill_id, sessions_completed)
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE sessions_completed = sessions_completed + 1, updated_at = CURRENT_TIMESTAMP`,
            [match.learner_user_id, match.skill_id]
        );

        // Check if learner can advance their ladder level (simplified for now)
        // This would be more complex, involving checking all learning skills.
        const [[progress]] = await pool.query(
            'SELECT sessions_completed, required_sessions_to_advance FROM Progress WHERE user_id = ? AND skill_id = ?',
            [match.learner_user_id, match.skill_id]
        );

        if (progress && progress.sessions_completed >= progress.required_sessions_to_advance) {
            // Potentially update User.current_level if ALL required skills for that level are completed
            // This requires more complex logic, possibly in a dedicated `progressController` function.
            console.log(`User ${match.learner_user_id} has completed enough sessions for skill ${match.skill_id}. Check for ladder advancement!`);
        }
        // --- End of update logic ---


        res.json({ message: 'Session completed and feedback recorded' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error completing session');
    }
};

// @route   GET /api/sessions/user/:userId
// @desc    Get all sessions for a user (as teacher or learner)
// @access  Private
exports.getUserSessions = async (req, res) => {
    const userId = req.params.userId;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Unauthorized to view these sessions' });
    }
    try {
        const [sessions] = await pool.query(
            `SELECT s.session_id, s.session_date, s.duration_minutes, s.notes, s.status,
                    m.match_id, t.username AS teacher_username, l.username AS learner_username, sk.skill_name,
                    s.teacher_feedback_rating, s.learner_feedback_rating
             FROM Sessions s
             JOIN Matches m ON s.match_id = m.match_id
             JOIN Users t ON m.teacher_user_id = t.user_id
             JOIN Users l ON m.learner_user_id = l.user_id
             JOIN Skills sk ON m.skill_id = sk.skill_id
             WHERE m.teacher_user_id = ? OR m.learner_user_id = ?
             ORDER BY s.session_date DESC`,
            [userId, userId]
        );
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error fetching sessions');
    }
};