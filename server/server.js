const express = require('express');
const path = require('path');
const app = express();

// 1. Your API Routes (Keep these at the top)
app.get('/api/polls', (req, res) => {
    res.json({ message: "This is your data" });
});

// 2. Serve static files from the React 'dist' folder
app.use(express.static(path.join(__dirname, '../dist')));

// 3. Catch-all: If the route isn't an API route, send the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));