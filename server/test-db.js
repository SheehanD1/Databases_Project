const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM applications'
    );

    console.log('Connected to MySQL!');
    console.log('Applications:', rows[0].total);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();