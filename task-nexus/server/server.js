require('dotenv').config();
const express = require('express');
const cors = require("cors");
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.options('*', cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

/* ================= DATABASE ================= */

const fluxNexusHandler = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

fluxNexusHandler.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

/* ================= AUTH ================= */

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    const query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

    fluxNexusHandler.query(query, [username, email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const wsQuery = "INSERT INTO workspaces (name, description, owner_id) VALUES (?, ?, ?)";
        fluxNexusHandler.query(wsQuery, [`${username} Workspace`, 'Default workspace', results.insertId], (err2, wsResults) => {

            if (wsResults) {
                fluxNexusHandler.query(
                    "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')",
                    [wsResults.insertId, results.insertId]
                );

                fluxNexusHandler.query(
                    "INSERT INTO projects (name, description, workspace_id) VALUES (?, ?, ?)",
                    ['My First Project', 'Default project', wsResults.insertId]
                );
            }

            const token = jwt.sign(
                { id: results.insertId, username, email },
                JWT_SECRET
            );

            res.json({ token, user: { id: results.insertId, username, email } });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    fluxNexusHandler.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'No account found with this email' });
        }

        const user = results[0];

        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'Wrong password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    });
});

app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        fluxNexusHandler.query(
            'SELECT id, username, email FROM users WHERE id = ?',
            [decoded.id],
            (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(results[0]);
            }
        );
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

/* ================= WORKSPACES ================= */

app.get('/api/workspaces', (req, res) => {
    let userId = 1;

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) userId = jwt.verify(token, JWT_SECRET).id;
    } catch {}

    fluxNexusHandler.query(
        `SELECT w.*, wm.role 
         FROM workspaces w
         JOIN workspace_members wm ON w.id = wm.workspace_id
         WHERE wm.user_id = ?
         ORDER BY w.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/workspaces/:id', (req, res) => {
    fluxNexusHandler.query(
        'SELECT * FROM workspaces WHERE id = ?',
        [req.params.id],
        (err, results) => {
            res.json(results[0]);
        }
    );
});

app.post('/api/workspaces', (req, res) => {
    const { name, description } = req.body;

    let userId = 1;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) userId = jwt.verify(token, JWT_SECRET).id;
    } catch {}

    const query = "INSERT INTO workspaces (name, description, owner_id) VALUES (?, ?, ?)";

    fluxNexusHandler.query(query, [name, description, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        fluxNexusHandler.query(
            "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')",
            [results.insertId, userId]
        );

        res.json({ id: results.insertId, name, description, owner_id: userId, role: 'owner' });
    });
});

/* ================= PORT ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
