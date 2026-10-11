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
        a.company_id,
        a.status_id,
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

app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT company_id, name FROM companies ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch companies:', error.message);
    res.status(500).json({ error: 'Could not load companies' });
  }
});

app.get('/api/statuses', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT status_id, name FROM statuses ORDER BY status_id'
    );
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch statuses:', error.message);
    res.status(500).json({ error: 'Could not load statuses' });
  }
});

app.post('/api/applications', async (req, res) => {
  const {
    company_id,
    status_id,
    role_title,
    location,
    application_date
  } = req.body || {};

  const companyId = Number(company_id);
  const statusId = Number(status_id);

  if (
    !Number.isInteger(companyId) || companyId <= 0 ||
    !Number.isInteger(statusId) || statusId <= 0 ||
    typeof role_title !== 'string' ||
    !role_title.trim() ||
    role_title.trim().length > 150
  ) {
    return res.status(400).json({
      error: 'Provide a valid company, status, and role title (1–150 characters).'
    });
  }

  if (
    location != null &&
    (typeof location !== 'string' || location.trim().length > 150)
  ) {
    return res.status(400).json({
      error: 'Location must be text with at most 150 characters.'
    });
  }

  // Check both the date format and whether the date actually exists.
  const parsedDate = new Date(`${application_date}T00:00:00Z`);

  if (
    typeof application_date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(application_date) ||
    application_date < '1000-01-01' ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== application_date
  ) {
    return res.status(400).json({
      error: 'Provide a valid application date in YYYY-MM-DD format.'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO applications
         (company_id, status_id, role_title, location, application_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        companyId,
        statusId,
        role_title.trim(),
        location?.trim() || null,
        application_date
      ]
    );

    res.status(201).json({
      application_id: result.insertId,
      message: 'Application added successfully'
    });
  } catch (error) {
    console.error('Failed to add application:', error.message);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'The selected company or status does not exist.'
      });
    }

    res.status(500).json({ error: 'Could not add application' });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid application ID.' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM applications WHERE application_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json({ message: 'Application deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete application:', error.message);
    res.status(500).json({ error: 'Could not delete application.' });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid application ID.' });
  }

  const {
    company_id,
    status_id,
    role_title,
    location,
    application_date
  } = req.body || {};

  const companyId = Number(company_id);
  const statusId = Number(status_id);

  if (
    !Number.isSafeInteger(companyId) || companyId <= 0 ||
    !Number.isSafeInteger(statusId) || statusId <= 0 ||
    typeof role_title !== 'string' ||
    !role_title.trim() ||
    role_title.trim().length > 150
  ) {
    return res.status(400).json({
      error: 'Provide a valid company, status, and role title (1–150 characters).'
    });
  }

  if (
    location != null &&
    (typeof location !== 'string' || location.trim().length > 150)
  ) {
    return res.status(400).json({
      error: 'Location must be text with at most 150 characters.'
    });
  }

  if (
    typeof application_date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(application_date) ||
    application_date < '1000-01-01'
  ) {
    return res.status(400).json({
      error: 'Provide a valid application date in YYYY-MM-DD format.'
    });
  }

  const parsedDate = new Date(`${application_date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== application_date
  ) {
    return res.status(400).json({
      error: 'Provide a valid application date in YYYY-MM-DD format.'
    });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE applications
       SET company_id = ?,
           status_id = ?,
           role_title = ?,
           location = ?,
           application_date = ?
       WHERE application_id = ?`,
      [
        companyId,
        statusId,
        role_title.trim(),
        location?.trim() || null,
        application_date,
        id
      ]
    );

    // A save with unchanged values should still succeed.
    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        'SELECT application_id FROM applications WHERE application_id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Application not found.'
        });
      }
    }

    res.json({ message: 'Application updated successfully.' });
  } catch (error) {
    console.error('Failed to update application:', error.message);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: 'The selected company or status does not exist.'
      });
    }

    res.status(500).json({
      error: 'Could not update application.'
    });
  }
});

app.get('/api/reports/applications', async (req, res) => {
  const conditions = [];
  const values = [];

  for (const field of ['company_id', 'status_id']) {
    const value = req.query[field];

    if (value === undefined || value === '') continue;

    if (
      typeof value !== 'string' ||
      !/^[1-9]\d*$/.test(value) ||
      !Number.isSafeInteger(Number(value))
    ) {
      return res.status(400).json({
        error: `Invalid ${field}.`
      });
    }

    // field comes only from the fixed list above.
    conditions.push(`a.${field} = ?`);
    values.push(Number(value));
  }

  const dates = {};

  for (const field of ['start_date', 'end_date']) {
    const value = req.query[field];

    if (value === undefined || value === '') continue;

    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value < '1000-01-01'
    ) {
      return res.status(400).json({
        error: `Invalid ${field}; use YYYY-MM-DD.`
      });
    }

    const parsed = new Date(`${value}T00:00:00Z`);

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    ) {
      return res.status(400).json({
        error: `Invalid ${field}.`
      });
    }

    dates[field] = value;
  }

  if (
    dates.start_date &&
    dates.end_date &&
    dates.start_date > dates.end_date
  ) {
    return res.status(400).json({
      error: 'Start date must be on or before end date.'
    });
  }

  if (dates.start_date) {
    conditions.push('a.application_date >= ?');
    values.push(dates.start_date);
  }

  if (dates.end_date) {
    conditions.push('a.application_date <= ?');
    values.push(dates.end_date);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  try {
    const [rows] = await pool.execute(
      `SELECT
         a.application_id,
         c.name AS company,
         a.role_title,
         a.location,
         s.status_id,
         s.name AS status,
         a.application_date,
         COUNT(*) OVER () AS total_matches,
         COUNT(*) OVER (
           PARTITION BY s.status_id
         ) AS status_count
       FROM applications AS a
       JOIN companies AS c ON a.company_id = c.company_id
       JOIN statuses AS s ON a.status_id = s.status_id
       ${where}
       ORDER BY a.application_date DESC, a.application_id DESC`,
      values
    );

    const statusCounts = new Map();

    for (const row of rows) {
      statusCounts.set(row.status_id, {
        status_id: row.status_id,
        status: row.status,
        count: Number(row.status_count)
      });
    }

    res.json({
      total: rows.length ? Number(rows[0].total_matches) : 0,
      by_status: [...statusCounts.values()].sort(
        (a, b) => a.status_id - b.status_id
      ),
      applications: rows.map(row => ({
        application_id: row.application_id,
        company: row.company,
        role_title: row.role_title,
        location: row.location,
        status: row.status,
        application_date: row.application_date
      }))
    });
  } catch (error) {
    console.error('Failed to load report:', error.message);
    res.status(500).json({
      error: 'Could not load application report.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});