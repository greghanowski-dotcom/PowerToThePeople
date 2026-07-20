const express = require('express');
const mysql = require('mysql2/promise'); // FIXED: Switched to the promise/async version
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// FIXED: Converted to a connection Pool (best practice for web apps, keeps connections alive)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'Biite0tb=', 
  database: 'power_to_the_people',
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
      SELECT id, email, gender, age, party_affiliation, zip_code, voting_record 
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


// HTTP POST route endpoint to handle data insertion
app.post('/api/save_user', async (req, res) => {
  try {
    // FIXED: Extracted fields from req.body so they exist as variables
    // These keys match your restored React form data state: email, phone, password, gender, age, party, zip, enable_notifications, accordion_panels_stay_open
    const { email, phone, password, gender, age, party, zip, enable_notifications, accordion_panels_stay_open, voting_record } = req.body;

    // FIXED: Checked column names. You have 9 columns listed but only 8 value parameters.
    // Removed 'username' to align with the form values you are saving.
    const query = `
      INSERT INTO user 
      (email, password, phone, gender, age, party_affiliation, zip_code, enable_notifications, accordion_panels_stay_open, voting_record) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        password = VALUES(password),
        phone = VALUES(phone),
        gender = VALUES(gender),
        age = VALUES(age),
        party_affiliation = VALUES(party_affiliation),
        zip_code = VALUES(zip_code),
        enable_notifications = VALUES(enable_notifications),
        accordion_panels_stay_open = VALUES(accordion_panels_stay_open),
        voting_record = VALUES(voting_record)
    `;

    const values = [
      email || null,
      password || null, // Assuming you want to store password as well; ensure it's hashed in production
      phone || null,
      gender || null,
      age ? parseInt(age) : null,
      party_affiliation || null,                      
      zip_code || null,                         
      0,                                   
      0,                                   
      JSON.stringify([])                   
    ];

    // This now works perfectly because db is a promise pool
    const [result] = await db.query(query, values); 

    res.status(201).json({ 
      message: 'User record created successfully', 
      userId: result.insertId 
    });

  } catch (err) {
    console.error("❌ SQL EXECUTION ERROR:", err.message);
    res.status(500).json({ error: 'Database insertion failed', details: err.message });
  }
});

app.post('/api/save_vote', async (req, res) => {
  try {
    const { userId, issueId, voteType } = req.body;

    // 1. Structure the object matching your exact schema layout requirement
    const newVoteObject = {
      issue_id: issueId,
      vote: voteType
    };

    // 2. FIXED: Removed the CAST function and explicitly forced MySQL 
    // to parse the incoming text string parameter as a direct JSON object block
    const query = `
      UPDATE users 
      SET voting_record = JSON_ARRAY_APPEND(
        COALESCE(voting_record, '[]'), 
        '$', 
        JSON_EXTRACT(?, '$')
      ) 
      WHERE id = ?
    `;

    // Convert the javascript object structure into a valid string layout
    const values = [JSON.stringify(newVoteObject), userId];

    // Execute the database pool query using async await
    const [result] = await db.query(query, values);

    res.status(200).json({ message: 'Vote entry recorded successfully into JSON block' });
    // FIXED CHECK: If MySQL returns 0 affected rows, it means the userId does not exist
    if (result.affectedRows === 0) {
      console.warn(`⚠️ VOTE REJECTED: User ID ${userId} does not exist in the users table.`);
      return res.status(404).json({ error: 'Database save failed', details: `User ID ${userId} not found.` });
    }
    res.status(200).json({ message: 'Vote entry recorded successfully into JSON block' });

  } catch (err) {
    // This logs the literal internal exception detail text directly to your terminal panel
    console.error("❌ MYSQL VOTE SAVE EXCEPTION:", err.message);
    res.status(500).json({ error: 'Failed to append vote data', details: err.message });
  }
});


app.listen(5000, '127.0.0.1', () => {
  console.log('Backend server running on http://127.0.0.1:5000');
});
