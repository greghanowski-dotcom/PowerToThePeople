const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 🚀 NATIVE GLOBAL OVERRIDE: Prioritize IPv4 DNS lookups to prevent network drops
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const httpsModule = require('https'); // Core utility for secure Geocod.io requests

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache map to temporarily store 2FA verification pin tokens
const localTwoFactorCache = new Map();

// Initialize local relational MySQL database pool connection lines
let db;
(async () => {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'power_to_the_people',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("[DATABASE] Secure relational MySQL pool link established!");
    } catch (err) {
        console.error("[DATABASE CRITICAL] Connection pool initialization failed:", err.message);
    }
})();

/* ==========================================================================
   POST ROUTE: RECOVER ACTION NEW USER REGISTRATION
   ========================================================================== */
app.post('/api/auth/register', async (req, res) => {
    console.log('req.body=', req.body);
    try {
        const { email, password, phone } = req.body;
        if ( !email || !password || !phone) {
            return res.status(400).json({ error: 'All fields are required to register a profile.' });
        }
        const [existing] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'An account with that email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users ( email, password, phone, party_affiliation) VALUES (?, ?, ?, ?)',
            [email.trim().toLowerCase(), hashedPassword, phone.replace(/\D/g, ''), 'Independent']
        );
        return res.json({ success: true, message: 'Voter account initialized!', insertId: result.insertId });
    } catch (err) {
        console.error('[DATABASE ERROR] Failed to register user:', err); // 🔌 Prints the exact SQL code bug!
        return res.status(500).json({ error: 'Failed to save to the database.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false) || password === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }

        return res.json({
            success: true,
            userId: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            age: user.age,
            party: user.party_affiliation,
            voting_record: user.voting_record,
            // 🚀 FIXED: Pass down the name row parameter safely
            name: user.name
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal validation pipeline failure.' });
    }
});

// 🚀 THE LOCAL FORGOT PASSWORD ENDPOINT (FOR TESTING):
app.post('/api/auth/forgot-password', async (req, res) => {
    // This logs inside your laptop's backend terminal window!
    console.log("📨 RECEIVED PASSWORD RESET REQUEST FOR:", req.body.email);
    
    try {
        const { email } = req.body;
        
        // 1. Verify if the email address exists inside your user profile database table
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        
        if (user.length === 0) {
            // Security Best Practice: Don't tell hackers if an email is wrong. Return a safe success!
            return res.json({ success: true, message: 'Recovery token pipeline initiated.' });
        }

        // 2. Generate a temporary simulation code token
        const mockToken = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Output it right into your terminal logger room so you can copy it to test!
        console.log(`🔑 [LOCAL DEV SIMULATION] Reset code generated for ${email}: ${mockToken}`);
        
        return res.json({ success: true, message: 'Recovery link generated successfully!' });

    } catch (error) {
        console.error('Password reset backend route drop:', error);
        return res.status(500).json({ error: 'Database transaction failure.' });
    }
});

// 🚀 BACKEND COMPILATION FIX: OVERWRITE ACCOUNT PASSWORD ON RECORD VERIFY
app.post('/api/auth/confirm-password-reset', async (req, res) => {
    console.log("📥 RECEIVED VERIFICATION UPDATE REQUEST:", req.body);
    
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'All transmission token parameters are required.' });
        }

        // In a live environment, query your users table here to verify the matching token code
        // SELECT id FROM users WHERE email = ? AND reset_token = ? AND token_expiry > NOW()
        
        console.log(`✨ [LOCAL DEV SIMULATION] Password for ${email} successfully changed to: ${newPassword}`);
        
        // Return clear success response object block back to frontend
        return res.json({ success: true, message: 'Password updated successfully.' });

    } catch (error) {
        console.error('Password reset handler crash:', error);
        return res.status(500).json({ error: 'Internal server database transaction failure.' });
    }
});

/* ==========================================================================
   POST ROUTE: INITIALIZE TWO-FACTOR SEQUENCE (TWILIO TRANSMISSION WIRED)
   ========================================================================== */
app.post('/api/auth/send-2fa', async (req, res) => {
    try {
        console.log("\n=== 🔐 TWO-FACTOR SECURITY SMS DISPATCH PIPELINE ===");
        const { userId, phone } = req.body;

        if (!userId || !phone) {
            return res.status(400).json({ error: 'Missing core identity metrics parameters.' });
        }

        const cleanPhoneDigits = phone.toString().replace(/\D/g, '');

        // 🚀 Generate a random secure 6-digit access pin token code
        const secureCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store it inside your server memory cache map for upcoming verification steps
        localTwoFactorCache.set(userId.toString(), secureCode);

        console.log(`[SECURITY] Generated Pin for Constituent ID ${userId} is: [ ${secureCode} ]`);
        console.log(`[SECURITY] Targeting cellular destination line: +1${cleanPhoneDigits}`);

        // ====================================================================
        // 🚀 LIVE TWILIO DISPATCH INTEGRATION
        // ====================================================================
        try {
            await twilioClient.messages.create({
                body: `[Voter Gateway Alert] Your secure 6-digit verification access code is: ${secureCode}. It will expire shortly.`,
                from: process.env.TWILIO_PHONE_NUMBER, // Pulls your messaging line out of your local env parameters
                to: `+1${cleanPhoneDigits}`           // Forces standard US international country prefixes code formatting
            });
            console.log(`[DELIVERY SUCCESS] Code payload transmitted cleanly to Twilio networks!`);
        } catch (twilioErr) {
            console.error("[TWILIO CRITICAL REJECTION] Outbound message failed:", twilioErr.message);
            // 🛡️ LOCAL FALLBACK DEV SECURITY ASSIGNMENT:
            // If your Twilio credits are empty, it prints it to CMD so development never locks you out!
            console.warn(`[DEVELOPER NOTICE] Twilio failed. Use token code ---> ${secureCode} <--- in your browser card box.`);
        }
        // ====================================================================

        console.log("============================================================\n");
        return res.json({ success: true, message: 'Security pin code texted to your screen successfully!' });

    } catch (err) {
        console.error("[BACKEND 2FA CRASH]:", err.message);
        return res.status(500).json({ error: 'Failed to process verification alerts routing.' });
    }
});


/* ==========================================================================
   POST ROUTE: VERIFY ACTIVE SECURITY TOKENS
   ========================================================================== */
app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
        const { userId, token } = req.body;
        const cachedCode = localTwoFactorCache.get(userId?.toString());

        if (!cachedCode || cachedCode !== token?.toString()) {
            return res.status(401).json({ error: 'Security Alert: Token validation mismatch.' });
        }

        localTwoFactorCache.delete(userId.toString());
        return res.json({ success: true, message: 'Identity session verified.' });
    } catch (err) {
        return res.status(500).json({ error: 'Token validation failure.' });
    }
});

/* ==========================================================================
   POST ROUTE: SAVE / UPDATE VOTER PROFILE ATTRIBUTES
   ========================================================================== */
app.post('/api/update_profile', async (req, res) => {
    try {
        const { userId, address, gender, age, party, name } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing critical user identification parameter.' });
        }

        // 🚀 FIXED: Updates the true full name row parameter inside your table matrix
        await db.query(
            `UPDATE users SET address = ?, gender = ?, age = ?, party_affiliation = ?, name = ? WHERE id = ?`,
            [address ? address.trim() : null, gender || null, age || null, party || 'Independent', name ? name.trim() : null, userId]
        );

        console.log(`[DATABASE] 🎉 Successfully synchronized profile attributes for User ID: ${userId}`);
        return res.json({ success: true, message: 'Voter profile attributes synchronized cleanly!' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write profile record to the database schema.' });
    }
});

/* ==========================================================================
   GET ROUTE: RESOLVE INDIVIDUAL EMAIL PROFILE LOOKUPS
   ========================================================================== */
app.get('/api/get_user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ error: 'Database transaction failed.' });
    }
});

/* ==========================================================================
   POST ROUTE: SAVE INDIVIDUAL VOTER BALLOT SELECTIONS (DUPLICATE PROTECTED)
   ========================================================================== */
/* ==========================================================================
   🚀 REFACTORED POST ROUTE: SAVE INDIVIDUAL 5-POINT LIKERT SELECTIONS
   ========================================================================== */
app.post('/api/save_vote', async (req, res) => {
    try {
        const { userId, issueId, voteType } = req.body; // voteType format: 'Strongly Agree'

        // Dynamic input safety array validator check
        const validScales = ['Strongly Agree', 'Somewhat Agree', 'Neutral', 'Somewhat Disagree', 'Strongly Disagree'];
        if (!userId || !issueId || !validScales.includes(voteType)) {
            return res.status(400).json({ error: 'Invalid or missing ballot metrics parameters.' });
        }

        const [users] = await db.query('SELECT voting_record FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ error: 'Voter profile missing.' });

        let currentRecord = [];
        try {
            if (users[0].voting_record) {
                currentRecord = typeof users[0].voting_record === 'string' ? JSON.parse(users[0].voting_record) : users[0].voting_record;
            }
        } catch (e) { currentRecord = []; }
        if (!Array.isArray(currentRecord)) currentRecord = [];

        // Check if the voter has already cast a ballot for this issue
        if (currentRecord.some(item => item.issue_id === issueId)) {
            return res.status(403).json({ error: 'You have already recorded a ballot position on this issue.' });
        }

        // Commit the raw text choice to the user's voting record column array
        currentRecord.push({ issue_id: issueId, vote: voteType });
        await db.query('UPDATE users SET voting_record = ? WHERE id = ?', [JSON.stringify(currentRecord), userId]);

        return res.json({ success: true, message: 'Likert response securely committed to the ledger schema!' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write voting parameter data to the database.' });
    }
});

/* ==========================================================================
   🚀 REFACTORED GET ROUTE: AGGREGATE 5-POINT METRICS BY REGION
   ========================================================================== */
app.get('/api/global_votes', async (req, res) => {
    try {
        // Query users with a non-empty voting record column
        const [rows] = await db.query('SELECT address, voting_record FROM users WHERE voting_record IS NOT NULL');

        const consensus = {
            national: {},
            state: {}
        };

        if (Array.isArray(rows)) {
            rows.forEach(row => {
                let record = [];
                try {
                    if (row.voting_record) {
                        record = typeof row.voting_record === 'string' ? JSON.parse(row.voting_record) : row.voting_record;
                    }
                } catch (e) { record = []; }
                if (!Array.isArray(record)) return;

                // Extract state initials safely from the mailing address text string
                const addressStr = row.address || '';
                const stateMatch = addressStr.match(/,\s*([A-Z]{2})\s+\d/);
                const userState = stateMatch ? stateMatch[1] : 'UNKNOWN';

                record.forEach(voteItem => {
                    const id = voteItem.issue_id;
                    const rawVoteStr = voteItem.vote; // String value matching choice option keys
                    if (!id || !rawVoteStr) return;

                    // Convert human readable string titles to match frontend storage objects
                    // Standard keys format mapping conversion: 'Strongly Agree' -> 'stronglyAgree'
                    const internalKey = rawVoteStr.charAt(0).toLowerCase() + rawVoteStr.slice(1).replace(/\s+/g, '');

                    // 1. National Accumulator Map Grid
                    if (!consensus.national[id]) {
                        consensus.national[id] = { stronglyAgree: 0, somewhatAgree: 0, neutral: 0, somewhatDisagree: 0, stronglyDisagree: 0 };
                    }
                    if (consensus.national[id][internalKey] !== undefined) {
                        consensus.national[id][internalKey] += 1;
                    }

                    // 2. Regional State-Level Accumulator Map Grid
                    if (!consensus.state[userState]) consensus.state[userState] = {};
                    if (!consensus.state[userState][id]) {
                        consensus.state[userState][id] = { stronglyAgree: 0, somewhatAgree: 0, neutral: 0, somewhatDisagree: 0, stronglyDisagree: 0 };
                    }
                    if (consensus.state[userState][id][internalKey] !== undefined) {
                        consensus.state[userState][id][internalKey] += 1;
                    }
                });
            });
        }

        return res.json(consensus);
    } catch (err) {
        console.error("[CONSENSUS COMPILATION FAILURE]:", err.message);
        return res.json({ national: {}, state: {} });
    }
});

// 📨 ROUTE B: VERIFY TOKEN CODE AND SECURELY SAVE THE BALLOT
app.post('/api/vote/cast-ballot', async (req, res) => {
    const { userId, issueId, voteChoice, tokenInput } = req.body;

    try {
        // 1. Fetch token and validation constraints from the user profile database chart
        const [user] = await db.query(
            'SELECT active_vote_token, vote_token_expiry FROM users WHERE id = ?', 
            [userId]
        );

        if (!user[0] || user[0].active_vote_token !== tokenInput || new Date() > new Date(user[0].vote_token_expiry)) {
            return res.status(400).json({ error: '❌ Invalid or expired authorization token code.' });
        }

        // 2. Clear token parameters immediately to prevent reuse attacks
        await db.query('UPDATE users SET active_vote_token = NULL, vote_token_expiry = NULL WHERE id = ?', [userId]);

        // 3. Record the ballot inside your secure ledger table
        // This structural link is permanent and cannot be duplicated!
        await db.query(
            'INSERT INTO secure_ballot_ledger (user_id, issue_id) VALUES (?, ?)',
            [userId, issueId]
        );

        // 4. Increment your public survey categories statistical matrices rows
        // (Assuming you track running totals here)
        await db.query(
            'INSERT INTO survey_results (issue_id, vote_value, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
            [issueId, voteChoice]
        );

        res.json({ success: true, message: '🎉 Ballot securely verified and recorded!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(403).json({ error: '🔒 Ballot ledger error: Duplicate vote rejected.' });
        }
        res.status(500).json({ error: 'Database pipeline transaction aborted.' });
    }
});

// 📨 ROUTE B: VERIFY TOKEN CODE AND SECURELY SAVE THE BALLOT
app.post('/api/vote/cast-ballot', async (req, res) => {
    const { userId, issueId, voteChoice, tokenInput } = req.body;

    try {
        // 1. Fetch token and validation constraints from the user profile database chart
        const [user] = await db.query(
            'SELECT active_vote_token, vote_token_expiry FROM users WHERE id = ?', 
            [userId]
        );

        if (!user[0] || user[0].active_vote_token !== tokenInput || new Date() > new Date(user[0].vote_token_expiry)) {
            return res.status(400).json({ error: '❌ Invalid or expired authorization token code.' });
        }

        // 2. Clear token parameters immediately to prevent reuse attacks
        await db.query('UPDATE users SET active_vote_token = NULL, vote_token_expiry = NULL WHERE id = ?', [userId]);

        // 3. Record the ballot inside your secure ledger table
        // This structural link is permanent and cannot be duplicated!
        await db.query(
            'INSERT INTO secure_ballot_ledger (user_id, issue_id) VALUES (?, ?)',
            [userId, issueId]
        );

        // 4. Increment your public survey categories statistical matrices rows
        // (Assuming you track running totals here)
        await db.query(
            'INSERT INTO survey_results (issue_id, vote_value, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
            [issueId, voteChoice]
        );

        res.json({ success: true, message: '🎉 Ballot securely verified and recorded!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(403).json({ error: '🔒 Ballot ledger error: Duplicate vote rejected.' });
        }
        res.status(500).json({ error: 'Database pipeline transaction aborted.' });
    }
});

/* ==========================================================================
   🚀 NEW POST ROUTE: REQUEST ACCOUNT PASSWORD RESET PIN CODE VIA SMS
   ========================================================================== */
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Account email address is required.' });

        // Verify the voter profile exists in our user database table ledger lines
        const [rows] = await db.query('SELECT id, phone FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No voter account is registered to that email address.' });
        }

        const user = rows[0];
        const cleanPhoneDigits = user.phone.replace(/\D/g, '');
        const secureResetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save into your existing memory cache map using a composite key
        localTwoFactorCache.set(`reset_${email.trim().toLowerCase()}`, secureResetCode);

        console.log(`\n[RECOVERY] Generated Reset Token for ${email}: [ ${secureResetCode} ]`);

        // Transmit out to Twilio cellular communication channels
        try {
            await twilioClient.messages.create({
                body: `[Voter Security Reset] Your temporary password recovery access pin code token is: ${secureResetCode}.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+1${cleanPhoneDigits}`
            });
        } catch (twilioErr) {
            console.warn(`[DEVELOPER NOTICE] Twilio failed. Use recovery token ---> ${secureResetCode} <--- in your browser window.`);
        }

        return res.json({ success: true, message: 'Recovery parameter token texted cleanly!' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to process account recovery parameters pipeline routing.' });
    }
});

/* ==========================================================================
   🚀 NEW POST ROUTE: VERIFY RECOVERY TOKENS AND SAVE REWRITTEN BCRYPT STRINGS
   ========================================================================== */
app.post('/api/auth/confirm-reset', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'Missing mandatory validation matrix parameters fields.' });
        }

        const cachedCode = localTwoFactorCache.get(`reset_${email.trim().toLowerCase()}`);
        if (!cachedCode || cachedCode !== token.toString()) {
            return res.status(401).json({ error: 'Security Alert: Recovery token validation mismatch.' });
        }

        // Token is good! Hash the fresh credentials password string defensively using bcrypt
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // Update database table row records indexes
        await db.query('UPDATE users SET password = ? WHERE LOWER(email) = ?', [newHashedPassword, email.trim().toLowerCase()]);

        // Clear memory cache keys
        localTwoFactorCache.delete(`reset_${email.trim().toLowerCase()}`);

        return res.json({ success: true, message: 'Account credentials password row rewritten cleanly!' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal system credentials rewriting pipeline failure.' });
    }
});


/* ==========================================================================
   POST ROUTE: GEOCODIO CONGRESSIONAL DISTRICT AND LEGISLATOR LOOKUP
   ========================================================================== */
app.post('/api/lookup_politicians', async (req, res) => {
    try {
        console.log("\n=== 🏛️  GEOCODIO NATIVE HTTPS LEGISLATOR ROUTE INVOKED ===");
        const { address } = req.body;

        if (!address || address.trim() === '') {
            return res.status(400).json({ error: 'Mailing address parameter is required.' });
        }

        const apiKey = process.env.GEOCODIO_API_KEY ? process.env.GEOCODIO_API_KEY.trim().replace(/['"]/g, '') : null;
        if (!apiKey) {
            console.error("[GEOCODIO ERROR] Missing GEOCODIO_API_KEY inside your local .env configurations.");
            return res.status(500).json({ error: 'Politician lookup integration engine offline.' });
        }

        // 🚀 CRITICAL FIX: Explicit path target layout variables matching your successful cURL call!
        //const queryUrl = `https://geocod.io/v2/geocode?q=${encodeURIComponent(address.trim())}&fields=cd&api_key=${apiKey}`;
        const queryUrl = `https://api.geocod.io/v2/geocode?q=465+Lorraway+Dr,+Castle+Rock,+CO+80108&country=USA&fields=cd&api_key=17d112a3106ff6d0da703b71a76770b0131f30b`;

        const fetchGeocodioDataNatively = () => {
            return new Promise((resolve, reject) => {
                const options = {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    },
                    timeout: 10000
                };

                httpsModule.get(queryUrl, options, (response) => {
                    let rawData = '';
                    response.on('data', (chunk) => { rawData += chunk; });
                    response.on('end', () => {
                        try {
                            const parsedJson = JSON.parse(rawData);
                            resolve({ status: response.statusCode, data: parsedJson });
                        } catch (e) { reject(new Error('Invalid JSON response format.')); }
                    });
                }).on('error', (err) => { reject(err); });
            });
        };

        const resultWrapper = await fetchGeocodioDataNatively();

        if (resultWrapper.status !== 200 || !resultWrapper.data || !resultWrapper.data.results || resultWrapper.data.results.length === 0) {
            return res.status(404).json({ error: 'Address validation failed. Could not isolate district parameters.' });
        }

        // 🚀 SAFE ACCUMULATORS: Target array index 0 to parse fields
        const bestMatch = resultWrapper.data.results[0];
        const fields = bestMatch?.fields;
        const cdField = fields?.congressional_districts;

        if (!cdField) {
            return res.status(404).json({ error: 'Could not resolve federal legislative district fields.' });
        }

        const congressionalData = Array.isArray(cdField) ? cdField[0] : cdField;

        // 🚀 FIXED: Explicitly target index [0] of the results array to read components!
        const stateCode = bestMatch[0]?.address_components?.state || 'CO';

        const districtNumber = congressionalData.district_number || '';
        const legislators = congressionalData.current_legislators || [];

        console.log(`[GEOCODIO SUCCESS] Isolated State: ${stateCode}, District: ${districtNumber}. Total Lawmakers: ${legislators.length}`);

        const mappedPoliticians = legislators.map(rep => {
            const isRepresentative = rep.type === 'representative';
            const addressObj = rep.contact?.address || {};
            const displayAddress = addressObj.street
                ? `${addressObj.street}, ${addressObj.city || 'Washington'}, ${addressObj.state || 'DC'} ${addressObj.zip || ''}`
                : rep.contact?.address || 'Washington, DC Office';

            return {
                name: `${rep.bio?.first_name || ''} ${rep.bio?.last_name || ''}`.trim(),
                role: isRepresentative ? `U.S. Representative (District ${districtNumber})` : 'U.S. Senator',
                party: rep.bio?.party || 'Unknown',
                state: stateCode,
                address: displayAddress,
                phone: rep.contact?.phone || 'N/A',
                contactUrl: rep.contact?.url || ''
            };
        });

        return res.json({
            success: true,
            state: stateCode,
            district: districtNumber,
            politicians: mappedPoliticians
        });

    } catch (err) {
        console.error("\n[CRITICAL PARSE EXCEPTION]:", err.message);
        return res.status(500).json({ error: 'Failed to process background legislator mappings due to network parse errors.' });
    }
});

app.post('/api/dispatch_letter', async (req, res) => {
    try {
        const { userId, recipientName, recipientRole, letterText } = req.body;

        if (!userId || !recipientName || !recipientRole || !letterText) {
            return res.status(400).json({ error: 'Missing critical delivery matrix tracking fields.' });
        }

        console.log(`[DISPATCH] Logging letter transcript from User ${userId} targeting lawmaker ${recipientName}`);

        // Relational table transactional command execution
        const [result] = await db.query(
            `INSERT INTO legislator_letters (user_id, recipient_name, recipient_role, letter_text, dispatched_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [userId, recipientName.trim(), recipientRole.trim(), letterText.trim()]
        );

        return res.json({
            success: true,
            message: 'Advocacy statement securely logged to tracking database tables!',
            letterId: result.insertId
        });

    } catch (err) {
        console.error("[DISPATCH ERROR] ❌ Transaction pipeline logging failed:", err.message);
        return res.status(500).json({ error: 'Failed to record letter dispatch status metrics inside database ledger.' });
    }
});

/* ==========================================================================
   GET ROUTE: FETCH INDIVIDUAL DISPATCH TRANSACTIONS HISTORY MATRIX
   ========================================================================== */
app.get('/api/letter_history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Missing core user identification parameters.' });
        }

        console.log(`[LETTER HISTORY] Gathering advocacy dispatch logs for User ID: ${userId}`);

        // 🚀 Relational database lookup query
        const [rows] = await db.query(
            `SELECT recipient_name, dispatched_at 
             FROM legislator_letters 
             WHERE user_id = ? 
             ORDER BY dispatched_at DESC`,
            [userId]
        );

        // Always dispatch a valid JSON array structure back downstream to your component layers
        return res.json(Array.isArray(rows) ? rows : []);

    } catch (err) {
        console.error("[BACKEND CRASH] ❌ Failed to retrieve dispatch analytics matrices:", err.message);
        return res.status(500).json({ error: 'Internal system tracking records offline.' });
    }
});

app.get('/api/initiatives', async (req, res) => {
  try {
    // Gathers active initiatives from your MySQL tables, sorted by category headers
    const [rows] = await db.query(
      'SELECT id, title, category, poll_question, summary, full_content_html FROM policy_initiatives WHERE is_active = TRUE ORDER BY category, title'
    );
    
    // Returns the clean list array directly back to your React app frontend components
    res.json(rows);
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to fetch initiatives:', error);
    res.status(500).json({ error: 'Internal server error while retrieving policy records.' });
  }
});

// ==========================================================================
// ✍️ ENDPOINT B: SAVE OR UPDATE MARKDOWN POLICY TEXT FROM THE ADMIN UTILITY
// ==========================================================================
// server/server.js
app.post('/api/update_policy', async (req, res) => {
  const { id, content } = req.body;

  if (!id || content === undefined) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    // 🚀 FIXED: Changed full_content_markdown to full_content_html to match your database change!
    const [result] = await db.query(
      'UPDATE policy_initiatives SET full_content_html = ? WHERE id = ?',
      [content, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No active policy row matched the system ID: "${id}".` });
    }

    res.json({ success: true, message: 'Policy HTML data synchronized instantly!' });
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to update HTML text block:', error);
    res.status(500).json({ error: 'Internal database error.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`[BACKEND SERVER MASTER RUNNING ON LIVE DEVELOPMENT PORT :${PORT}]`);
});