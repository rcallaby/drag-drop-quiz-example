// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Admin Auth
app.use('/admin', basicAuth({
  users: { 'admin': 'password123' },
  challenge: true
}));

// Load Questions
app.get('/api/question', (req, res) => {
  fs.readFile('questions.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load questions' });
    res.json(JSON.parse(data || '[]'));
  });
});

// Save Questions
app.post('/api/question', (req, res) => {
  fs.writeFile('questions.json', JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save questions' });
    res.json({ success: true });
  });
});

// Submit Answers
app.post('/api/submit', (req, res) => {
  fs.readFile('results.json', 'utf8', (err, data) => {
    const results = JSON.parse(data || '[]');
    results.push({ ...req.body, timestamp: new Date().toISOString() });
    fs.writeFile('results.json', JSON.stringify(results, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Submission failed' });
      res.json({ success: true });
    });
  });
});

// Get All Results
app.get('/api/results', (req, res) => {
  fs.readFile('results.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load results' });
    res.json(JSON.parse(data || '[]'));
  });
});

// Get Individual User Result
app.get('/api/results/:username', (req, res) => {
  fs.readFile('results.json', 'utf8', (err, data) => {
    const results = JSON.parse(data || '[]');
    const userResults = results.filter(r => r.username === req.params.username);
    res.json(userResults);
  });
});

// Export Results
app.get('/api/export', (req, res) => {
  res.download('results.json', 'quiz_results.json');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
