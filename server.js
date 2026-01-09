const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ==================== AUTH ENDPOINTS ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        db.run(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: 'Error creating user' });
                }

                // Create JWT token
                const token = jwt.sign(
                    { id: this.lastID, username },
                    JWT_SECRET,
                    { expiresIn: '30d' }
                );

                res.status(201).json({
                    message: 'User created successfully',
                    token,
                    user: { id: this.lastID, username }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username }
        });
    });
});

// ==================== PROGRESS ENDPOINTS ====================

// Get all progress for a user
app.get('/api/progress', authenticateToken, (req, res) => {
    db.all(
        'SELECT quiz_name, attempts, passes FROM quiz_progress WHERE user_id = ?',
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching progress' });
            }
            res.json({ progress: rows });
        }
    );
});

// Get progress for a specific quiz
app.get('/api/progress/:quizName', authenticateToken, (req, res) => {
    db.get(
        'SELECT quiz_name, attempts, passes FROM quiz_progress WHERE user_id = ? AND quiz_name = ?',
        [req.user.id, req.params.quizName],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching progress' });
            }
            if (!row) {
                return res.json({ progress: { attempts: 0, passes: 0 } });
            }
            res.json({ progress: row });
        }
    );
});

// Update progress (record new attempt)
app.post('/api/progress', authenticateToken, (req, res) => {
    const { quiz_name, passed, score, total_questions } = req.body;

    if (!quiz_name || passed === undefined) {
        return res.status(400).json({ error: 'quiz_name and passed are required' });
    }

    // First, insert into quiz_attempts for history
    db.run(
        'INSERT INTO quiz_attempts (user_id, quiz_name, score, total_questions, passed) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, quiz_name, score, total_questions, passed ? 1 : 0],
        (err) => {
            if (err) {
                console.error('Error inserting attempt:', err);
            }
        }
    );

    // Then update or insert into quiz_progress
    db.get(
        'SELECT * FROM quiz_progress WHERE user_id = ? AND quiz_name = ?',
        [req.user.id, quiz_name],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating progress' });
            }

            if (row) {
                // Update existing record
                const newAttempts = row.attempts + 1;
                const newPasses = row.passes + (passed ? 1 : 0);

                db.run(
                    'UPDATE quiz_progress SET attempts = ?, passes = ?, last_updated = CURRENT_TIMESTAMP WHERE user_id = ? AND quiz_name = ?',
                    [newAttempts, newPasses, req.user.id, quiz_name],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error updating progress' });
                        }
                        res.json({
                            message: 'Progress updated',
                            progress: {
                                quiz_name,
                                attempts: newAttempts,
                                passes: newPasses
                            }
                        });
                    }
                );
            } else {
                // Insert new record
                db.run(
                    'INSERT INTO quiz_progress (user_id, quiz_name, attempts, passes) VALUES (?, ?, ?, ?)',
                    [req.user.id, quiz_name, 1, passed ? 1 : 0],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error creating progress record' });
                        }
                        res.json({
                            message: 'Progress created',
                            progress: {
                                quiz_name,
                                attempts: 1,
                                passes: passed ? 1 : 0
                            }
                        });
                    }
                );
            }
        }
    );
});

// Reset progress for a specific quiz
app.delete('/api/progress/:quizName', authenticateToken, (req, res) => {
    db.run(
        'DELETE FROM quiz_progress WHERE user_id = ? AND quiz_name = ?',
        [req.user.id, req.params.quizName],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error resetting progress' });
            }
            res.json({ message: 'Progress reset successfully' });
        }
    );
});

// Get quiz attempt history
app.get('/api/history/:quizName', authenticateToken, (req, res) => {
    db.all(
        'SELECT score, total_questions, passed, attempt_date FROM quiz_attempts WHERE user_id = ? AND quiz_name = ? ORDER BY attempt_date DESC LIMIT 20',
        [req.user.id, req.params.quizName],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching history' });
            }
            res.json({ history: rows });
        }
    );
});

// ==================== STATS ENDPOINTS ====================

// Get overall statistics for user
app.get('/api/stats', authenticateToken, (req, res) => {
    db.get(
        'SELECT SUM(attempts) as total_attempts, SUM(passes) as total_passes FROM quiz_progress WHERE user_id = ?',
        [req.user.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching stats' });
            }
            const totalAttempts = row.total_attempts || 0;
            const totalPasses = row.total_passes || 0;
            const passRate = totalAttempts > 0 ? Math.round((totalPasses / totalAttempts) * 100) : 0;

            res.json({
                stats: {
                    total_attempts: totalAttempts,
                    total_passes: totalPasses,
                    pass_rate: passRate
                }
            });
        }
    );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'PPL Quiz Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 PPL Quiz Backend Server running on port ${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
    console.log(`\n📚 Available endpoints:`);
    console.log(`   POST   /api/auth/register     - Register new user`);
    console.log(`   POST   /api/auth/login        - Login`);
    console.log(`   GET    /api/progress          - Get all progress`);
    console.log(`   GET    /api/progress/:quiz    - Get quiz progress`);
    console.log(`   POST   /api/progress          - Update progress`);
    console.log(`   DELETE /api/progress/:quiz    - Reset quiz progress`);
    console.log(`   GET    /api/history/:quiz     - Get attempt history`);
    console.log(`   GET    /api/stats             - Get overall stats`);
    console.log(`   GET    /api/health            - Health check\n`);
});

module.exports = app;
