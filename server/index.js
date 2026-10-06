const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello World from the Express Backend!' });
});

app.get('/api/applications', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        a.application_id,
        c.name AS company,
        a.role_title,
        a.location,
        s.name AS status,
        a.application_date
      FROM applications AS a
      JOIN companies AS c ON a.company_id = c.company_id
      JOIN statuses AS s ON a.status_id = s.status_id
      ORDER BY a.application_id
    `);

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch applications:', error.message);
    res.status(500).json({ error: 'Could not load applications' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});