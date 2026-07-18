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


// HTTP POST route endpoint to handle data insertion
app.post('/api/save_user', async (req, res) => {
  try {
    // FIXED: Extracted fields from req.body so they exist as variables
    // These keys match your restored React form data state: email, gender, age, party, zip
    const { email, gender, age, party, zip } = req.body;

    // FIXED: Checked column names. You have 9 columns listed but only 8 value parameters.
    // Removed 'username' to align with the form values you are saving.
    const query = `
      INSERT INTO user 
      (email, gender, age, party_affiliation, zip_code, enable_notifications, accordion_panels_stay_open, voting_record) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      email || null,
      gender || null,
      age ? parseInt(age) : null,
      party || null,                       // Maps 'party' to party_affiliation
      zip || null,                         // Maps 'zip' to zip_code
      0,                                   // Default placeholder for notifications TINYINT
      0,                                   // Default placeholder for accordion TINYINT
      JSON.stringify([])                   // Default placeholder empty JSON array
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

app.listen(5000, '127.0.0.1', () => {
  console.log('Backend server running on http://127.0.0.1:5000');
});
