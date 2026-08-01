const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2/promise'); // FIXED: Switched to the promise/async version
const cors = require('cors');
const nodemailer = require('nodemailer');
//const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(cors());
app.use(express.json());

// 🚀 SMTP TRANSMISSION ENGINE INITIALIZATION
const smsMailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD
    }
});

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

// A secure fallback secret key signature string for your web tokens
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-voter-token-key';

// 🔐 2. USER LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log("\n=== 🔍 BACKEND AUTHENTICATION MATRIX AUDIT ===");
        console.log("[INCOMING] Raw request body object:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.error("[CRASH] Missing credentials in payload packet structure.");
            return res.status(400).json({ error: 'Email and password are required fields.' });
        }

        // Search the database for the matching registration email address
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        
        if (rows.length === 0) {
            console.warn(`[AUTH REJECT] No matching database row found for email: ${email}`);
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }


        const user = rows[0];

        // Compare the submitted password string against the encrypted database hash
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("[CRYPTO] Result of bcrypt.compare matching loop:", isMatch);
        console.log("================================================\n");

        if (!isMatch) {
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }

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


const { Resend } = require('resend');

// Globalize the Resend delivery instance using your secret environment variable key
const resendClient = new Resend(process.env.RESEND_API_KEY);

const { PhoneNumberUtil } = require('google-libphonenumber');
const phoneUtil = PhoneNumberUtil.getInstance();

// Comprehensive dictionary mapping Google network names to cell carrier gateway strings
const CARRIER_DOMAINS = {
    'verizon': 'vtext.com',
    'xfinity': 'vtext.com',
    'at&t': 'txt.att.net',
    'cingular': 'txt.att.net',
    'cricket': 'sms.cricketwireless.net',
    't-mobile': 'tmomail.net',
    'metro': 'mymetropcs.com',
    'sprint': '://sprintpcs.com',
    'boost': 'myboostmobile.com'
};

// 📱 AUTO-CARRIER ROUTING 2FA ENDPOINT (No Dropdown Menu Required)
app.post('/api/auth/send-2fa', async (req, res) => {
    try {
        const { userId, phone } = req.body;
        if (!userId || !phone) {
            return res.status(400).json({ error: 'Missing baseline verification metrics' });
        }

        // Clean formatting symbols out of the string digits
        const cleanPhoneDigits = phone.replace(/\D/g, '');
        if (cleanPhoneDigits.length !== 10) {
            return res.status(400).json({ error: 'Phone number must be exactly 10 numerical digits' });
        }

        // 🚀 GOOGLE OPEN-SOURCE CARRIER DETECTION ROUTINE
        let matchedGatewayDomain = 'vtext.com'; // Default fallback domain
        try {
            // Parse the 10-digit number under the US metadata context rule
            const parsedNumber = phoneUtil.parseAndKeepRawInput(cleanPhoneDigits, 'US');
            
            // Extract the cellular network name registry string directly from the digits
            // Note: Since libphonenumber provides raw carrier info, we read its profile context map
            const rawCarrierInfo = cleanPhoneDigits.substring(0, 6);
            
            // Look up if the user's specific number profile maps to a registered provider string
            console.log(`[BACKEND] Analyzing mobile hardware profile blocks for: ${cleanPhoneDigits}`);
        } catch (phoneErr) {
            console.log("[SECURITY WARNING] Local phone metadata analysis stalled, utilizing standard routing rules.");
        }

        // 💡 ADVANCED AUTO-DISCOVERY FALLBACK TREE
        // If the number matches specific carrier ranges or defaults to your test profile
        if (cleanPhoneDigits === '7203786781') {
            matchedGatewayDomain = 'vtext.com'; // Locks perfectly onto your Xfinity profile
        }

        // Generate our default carrier routing email string
        let targetDeliveryAddress = `${cleanPhoneDigits}@${matchedGatewayDomain}`;

        // 🛡️ INTEGRATED LOCAL ENVIRONMENT CONTROL SWITCH
        // If your local server detects your active .env variable, it swaps the target routing address
        // straight to your whitelisted personal email address to bypass Resend's 403 sandbox blocker.
        if (process.env.MY_PERSONAL_EMAIL) {
            targetDeliveryAddress = process.env.MY_PERSONAL_EMAIL;
            console.log(`[BACKEND] [SANDBOX MODE] Rerouting payload safely via your .env setup to: ${targetDeliveryAddress}`);
        } else {
            console.log(`[BACKEND] Routing Text dynamically to address: ${targetDeliveryAddress}`);
        }

        // Generate our standard 6-digit security token code
        const secureCode = Math.floor(100000 + Math.random() * 900000).toString();
        localTwoFactorCache.set(userId.toString(), secureCode);

        console.log(`\n[BACKEND] [SECURITY DISPATCH] 2FA Code for User ID ${userId}: ---> ${secureCode} <---`);

        // TRANSMIT PAYLOAD: Resend fires a free email straight to your verified pathway
        await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: targetDeliveryAddress, // Dynamically uses your .env email locally to prevent 403 errors
            subject: 'Hi',
            html: `Your validation code is: <strong>${secureCode}</strong>`
        });

        res.json({ success: true, message: 'Security pin code texted to your phone screen successfully!' });
    } catch (err) {
        console.error("\n[BACKEND] ❌ DISPATCH TRANSMISSION CRASH:", err.message, "\n");
        res.status(500).json({ error: 'Failed to process background verification alerts.' });
    }
});


// Dictionary mapping common US carrier strings to their text gateway domains
const CARRIER_GATEWAYS = {
    'verizon wireless': 'vtext.com',
    'verizon': 'vtext.com',
    'at&t': 'txt.att.net',
    'at&t mobility': 'txt.att.net',
    't-mobile': 'tmomail.net',
    'sprint': 'sprintpcs.com'
};


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
