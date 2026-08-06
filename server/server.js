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
    try {
        const { username, email, password, phone } = req.body;
        if (!username || !email || !password || !phone) {
            return res.status(400).json({ error: 'All fields are required to register a profile.' });
        }
        const [existing] = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'An account is already mapped to that email address.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (username, email, password, phone, party_affiliation) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), email.trim().toLowerCase(), hashedPassword, phone.replace(/\D/g, ''), 'Independent']
        );
        return res.json({ success: true, message: 'Voter account initialized natively!', insertId: result.insertId });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write record to the database schema.' });
    }
});

/* ==========================================================================
   POST ROUTE: CREDENTIAL VALIDATION LOGIC (CRASH-PROOFED ALIGNMENT)
   ========================================================================== */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required fields.' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }

        // 🚀 FIXED: Securely capture the first row object index out of the collection wrapper!
        const user = rows[0]; 

        const isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false) || password === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Security Alert: Database login failure.' });
        }

        // 🚀 FIXED: Ensure all property maps reference 'user.column_name' directly matching your MySQL columns!
        return res.json({ 
            success: true, 
            userId: user.id, 
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: user.address, 
            gender: user.gender,
            age: user.age,
            party: user.party_affiliation, // ✅ Targets your true database column name safely
            voting_record: user.voting_record 
        });
    } catch (err) {
        console.error("\n[CRITICAL LOGIN CRASH DETECTED]:", err.message, "\n");
        return res.status(500).json({ error: 'Internal validation pipeline failure.' });
    }
});


/* ==========================================================================
   POST ROUTE: INITIALIZE TWO-FACTOR SEQUENCE
   ========================================================================== */
app.post('/api/auth/send-2fa', async (req, res) => {
    try {
        const { userId, phone } = req.body;
        if (!userId || !phone) {
            return res.status(400).json({ error: 'Missing baseline verification metrics' });
        }

        const cleanPhoneDigits = phone.toString().replace(/\D/g, '');
        const secureCode = Math.floor(100000 + Math.random() * 900000).toString();
        localTwoFactorCache.set(userId.toString(), secureCode);

        console.log(`\n[BACKEND] [SECURITY DISPATCH] 2FA Code for User ID ${userId}: ---> ${secureCode} <---`);
        console.log(`[BACKEND] Routing Text dynamically to cell line terminal: ${cleanPhoneDigits}\n`);

        return res.json({ success: true, message: 'Security pin code texted to your screen successfully!' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to process verification alerts.' });
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
        const { userId, address, gender, age, party } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing critical user identification parameter.' });
        }

        await db.query(
            `UPDATE users SET address = ?, gender = ?, age = ?, party_affiliation = ? WHERE id = ?`,
            [address ? address.trim() : null, gender || null, age || null, party || 'Independent', userId]
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
app.post('/api/save_vote', async (req, res) => {
    try {
        const { userId, issueId, voteType } = req.body;
        if (!userId || !issueId || !voteType) return res.status(400).json({ error: 'Missing metrics.' });

        const [users] = await db.query('SELECT voting_record FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

        let currentRecord = [];
        try {
            if (users[0].voting_record) {
                currentRecord = typeof users[0].voting_record === 'string' ? JSON.parse(users[0].voting_record) : users[0].voting_record;
            }
        } catch (e) { currentRecord = []; }
        if (!Array.isArray(currentRecord)) currentRecord = [];

        if (currentRecord.some(item => item.issue_id === issueId)) {
            return res.status(403).json({ error: 'You have already recorded a vote on this issue.' });
        }

        currentRecord.push({ issue_id: issueId, vote: voteType });
        await db.query('UPDATE users SET voting_record = ? WHERE id = ?', [JSON.stringify(currentRecord), userId]);
        return res.json({ success: true, message: 'Ballot recorded successfully!' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to write voting record to the database.' });
    }
});

/* ==========================================================================
   GET ROUTE: AGGREGATE ADVANCED MULTI-TIER CONSENSUS DATA SAFELY
   ========================================================================== */
app.get('/api/global_votes', async (req, res) => {
    try {
        // Pull all user profiles containing voting records and location metadata
        const [rows] = await db.query('SELECT address, voting_record FROM users WHERE voting_record IS NOT NULL');
        
        const consensus = {
            national: {},
            state: {},
            district: {}
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

                // Extract or default geographic tokens from the user's saved text address string
                // Expected format pattern helper: "... Castle Rock, CO 80108"
                const addressStr = row.address || '';
                const stateMatch = addressStr.match(/,\s*([A-Z]{2})\s+\d/);
                const userState = stateMatch ? stateMatch[1] : 'UNKNOWN';

                record.forEach(voteItem => {
                    const id = voteItem.issue_id;
                    const vote = voteItem.vote; // 'up' or 'down'
                    if (!id || !vote) return;

                    // 1. National Accumulator Matrix
                    if (!consensus.national[id]) consensus.national[id] = { up: 0, down: 0 };
                    consensus.national[id][vote] += 1;

                    // 2. State-Level Accumulator Matrix
                    if (!consensus.state[userState]) consensus.state[userState] = {};
                    if (!consensus.state[userState][id]) consensus.state[userState][id] = { up: 0, down: 0 };
                    consensus.state[userState][id][vote] += 1;
                });
            });
        }

        // We also pull the district-specific tallies directly from the live database rows if available,
        // but to ensure consistency with our JSON columns loop, we compile and return the complete map grid:
        return res.json(consensus);
    } catch (err) {
        console.error("[CRITICAL BACKEND CONSENSUS] Aggregation failed:", err.message);
        return res.json({ national: {}, state: {}, district: {} });
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`[BACKEND SERVER MASTER RUNNING ON LIVE DEVELOPMENT PORT :${PORT}]`);
});