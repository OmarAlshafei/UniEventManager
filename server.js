const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Use Pool for managing connections
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const saltRounds = 10;

// Create a new pool instance to manage your database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.post('/api/adduniversity', async (req, res) => {
  const { name, location, description, num_students, abbrev } = req.body;

  if (!name || !location || !abbrev) {
    return res.status(400).json({ message: 'Please provide name, location, and abbreviation of the university.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO "University" (name, location, description, num_students, abbrev) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [name, location, description, num_students, abbrev]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding new university:', err);
    res.status(500).json({ message: 'Server error while creating university' });
  }
});

app.get('/api/universities', async (req, res) => {
  try {
    const result = await pool.query('SELECT university_id, name FROM "University"');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ message: 'Failed to fetch universities. Please try again later.' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, user_type } = req.body;

  if (!username || !email || !password || !user_type) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const userExistsResult = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists. Please choose another one.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInsertQuery = 'INSERT INTO "User" (username, email, password, user_type, university_id) VALUES ($1, $2, $3, $4, (SELECT university_id FROM "University" WHERE abbrev = $5)) RETURNING *';
    const universityAbrev = email.split('@')[1].split('.')[0].toUpperCase();
    const userInsertValues = [username, email, hashedPassword, user_type, universityAbrev];

    const insertResult = await pool.query(userInsertQuery, userInsertValues);
    res.json(insertResult.rows[0]);

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
});
