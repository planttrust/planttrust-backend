const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../shared/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../shared/config');

const router = express.Router();

// @route GET /api/auth
// @desc Auth API status check
router.get('/', (req, res) => {
  res.json({ message: 'auth API is working' });
});

// @route POST /api/auth/register
// @desc Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, fullName, role, phone } = req.body;
    const displayName = name || fullName;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows && userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: uuidv4(),
      name: displayName,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone: phone || null,
      createdAt: new Date().toISOString()
    };

    await db.query(
      'INSERT INTO users (id, name, email, password, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [newUser.id, newUser.name, newUser.email, newUser.password, newUser.role, newUser.phone, newUser.createdAt]
    );

    // Generate JWT
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser.id,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/auth/login
// @desc Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check user
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = userResult.rows[0];

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: 'Logged in successfully',
      userId: user.id,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
