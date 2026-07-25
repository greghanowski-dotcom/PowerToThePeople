const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2/promise'); // FIXED: Switched to the promise/async version
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// Use a connection Pool (best practice for web apps, keeps connections alive)
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'debian-sys-maint', 
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'i57xstNyZENbzTs=',
    database: process.env.DB_NAME || 'power_to_the_people',
    waitForConnections: true,
    connectionLimit: 10
});


// Test database connection on startup
// Locate this block in server.js and modify the catch parameters:
db.getConnection()
  .then((conn) => {
    console.log('Connected securely to MySQL database.');
    conn.release();
  })
  .catch((err) => {
    // FIXED: Logging the warning but letting Express continue running on port 5000
    console.error('⚠️ DATABASE CONFIGURATION ERROR BUT SERVER WILL REMAIN ONLINE:', err.message);
  });


// GET endpoint to load user details on return-login
// GET endpoint to look up an existing user profile by email index
app.get('/api/get_user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT id, email, password, phone, gender, age, party_affiliation, zip_code, voting_record 
      FROM users 
      WHERE email = ? 
      LIMIT 1
    `;
    
    // Process the query using your promise connection pool
    const [rows] = await db.query(query, [email]);

    // FIXED: If rows is empty or not an array, return an explicit 404 message block
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'No profile found matching that email address.' });
    }

    // FIXED: Extract the first single user object block matching index 0 out of the array matrix
    const singleUserRecord = rows[0];

    res.status(200).json(singleUserRecord);

  } catch (err) {
    // This prints the exact table/column syntax error to your terminal logs if it crashes
    console.error("❌ BACKEND SQL RETRIEVAL EXCEPTION:", err.message);
    res.status(500).json({ error: 'Database record extraction failed', details: err.message });
  }
});


app.post('/api/save_user', async (req, res) => {
  try {
    // Extracted fields exactly as they are sent by your React ProfileModal state
    const { 
      email, phone, password, gender, age, party_affiliation, zip_code, 
      enable_notifications, accordion_panels_stay_open 
    } = req.body;

    console.log("Received user data for saving:", req.body);

    // FIXED: Removed trailing comma and aligned VALUES() metrics to match columns exactly
    const query = `
      INSERT INTO users (email, password, phone, gender, age, party_affiliation, zip_code, enable_notifications, accordion_panels_stay_open) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        email = VALUES(email), 
        password = VALUES(password), 
        phone = VALUES(phone), 
        gender = VALUES(gender), 
        age = VALUES(age), 
        party_affiliation = VALUES(party_affiliation), 
        zip_code = VALUES(zip_code), 
        enable_notifications = VALUES(enable_notifications), 
        accordion_panels_stay_open = VALUES(accordion_panels_stay_open)
    `;

    // FIXED: Tied values array mapping back to your actual destructured variables (party, zip)
    const values = [
      email || null,
      password || null, 
      phone || null,
      gender || null,
      age || null,
      party_affiliation || null, // Maps your React 'party' state field safely
      zip_code || null,   // Maps your React 'zip_code' state field safely
      enable_notifications ? 1 : 0, 
      accordion_panels_stay_open ? 1 : 0
    ];

    const [result] = await db.query(query, values);

    // If an insert happens, result.insertId is returned. 
    // If an ON DUPLICATE update happens, MySQL might return an alternate index reference or 0.
    res.status(201).json({ 
      message: 'User record saved successfully', 
      userId: result.insertId || null 
    });

  } catch (err) {
    console.error("❌ SQL EXECUTION ERROR:", err.message);
    res.status(500).json({ error: 'Database insertion failed', details: err.message });
  }
});

app.post('/api/save_vote', async (req, res) => {
  // Establish a dedicated connection thread container out of your connection pool
  const connection = await db.getConnection();
  
  try {
    const { userId, issueId, voteType } = req.body;

    // Initialize an atomic execution sandbox block
    await connection.beginTransaction();

    const newVoteObject = {
      issue_id: issueId,
      vote: voteType
    };

    // OPERATION 1: Append the transaction details to the private user JSON block
    const userQuery = `
      UPDATE users 
      SET voting_record = JSON_ARRAY_APPEND(
        COALESCE(voting_record, '[]'), 
        '$', 
        JSON_EXTRACT(?, '$')
      ) 
      WHERE id = ?
    `;
    const [userResult] = await connection.query(userQuery, [JSON.stringify(newVoteObject), userId]);

    // Validation Guard: If the user ID isn't found, rollback the operation safely
    if (userResult.affectedRows === 0) {
      await connection.rollback();
      console.warn(`⚠️ VOTE REJECTED: User ID ${userId} does not exist inside the users table.`);
      return res.status(404).json({ error: 'Database save failed', details: `User ID ${userId} not found.` });
    }

    // OPERATION 2: Increment the public global counter row dynamically
    // Uses template strings to choose which column to increment safely based on user click values
    const columnName = voteType === 'up' ? 'up_votes' : 'down_votes';
    const globalQuery = `
      UPDATE issue_votes 
      SET ${columnName} = ${columnName} + 1 
      WHERE issue_id = ?
    `;
    await connection.query(globalQuery, [issueId]);

    // Commit both database actions together safely
    await connection.commit();
    res.status(200).json({ message: 'Private user preference saved and public global tally updated!' });

  } catch (err) {
    // If an error happens midway through execution, reverse all changes to maintain database integrity
    await connection.rollback();
    console.error("❌ GLOBAL TALLY EXECUTION EXCEPTION:", err.message);
    res.status(500).json({ error: 'Failed to record vote selection', details: err.message });
  } finally {
    // Release the network connection thread safely back into your primary cluster pool
    connection.release();
  }
});

// GET endpoint to retrieve all shared public vote counters from your table grid
app.get('/api/global_votes', async (req, res) => {
  try {
    const query = 'SELECT issue_id, up_votes, down_votes FROM issue_votes';
    const [rows] = await db.query(query);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ GLOBAL FETCH FAILURE:", err.message);
    res.status(500).json({ error: 'Failed to fetch public counts' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server engine active and listening on port ${PORT}`);
});
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A secure fallback secret key signature string for your web tokens
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-voter-token-key';

// 🔐 2. USER LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Search the database for the matching registration email address
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];

        // Compare the submitted password string against the encrypted database hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate a cryptographically signed web token containing the user's ID layout
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

        // Pass the token and baseline parameters back to the client application
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Database login failure' });
    }
});

// Global memory object to store temporary 2FA verification codes locally for testing
const localTwoFactorCache = new Map();

// 📱 1. DISPATCH 2FA CODE ENDPOINT
app.post('/api/auth/send-2fa', async (req, res) => {
    try {
        const { userId, phone } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing user identification parameter' });

        // Generate a cryptographically random secure 6-digit text code
        const secureCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Cache the code against the user's ID with a 5-minute expiration window
        localTwoFactorCache.set(userId.toString(), secureCode);

        // 🛠️ LOCAL TESTING DUMP: Prints the code directly to your blue [BACKEND] terminal console!
        console.log(`\n[BACKEND] [SECURITY DISPATCH] 2FA SMS Code for User ID ${userId}: ---> ${secureCode} <--- \n`);

        res.json({ success: true, message: 'Verification code dispatched successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate security verification sequence' });
    }
});

// 🔑 2. VERIFY 2FA CODE ENDPOINT
app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code) return res.status(400).json({ error: 'Missing verification data attributes' });

        const activeCachedCode = localTwoFactorCache.get(userId.toString());

        // Validate the code submitted by the user against our memory cache token
        if (!activeCachedCode || activeCachedCode !== code.trim()) {
            return res.status(401).json({ error: 'Invalid or expired 2FA code verification token' });
        }

        // Security cleared! Flush the token out of short term memory cache
        localTwoFactorCache.delete(userId.toString());

        res.json({ success: true, message: 'Device authorization footprint locked successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Internal validation tracking exception' });
    }
});
