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

// Login API endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password' });
  }

  const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
  });

  try {
      await client.connect();
      const result = await client.query('SELECT * FROM "User" WHERE username = $1', [username]);
      const user = result.rows[0];

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
          delete user.password;
          res.json({ message: 'Login successful', user });
      } else {
          res.status(401).json({ message: 'Incorrect password' });
      }
  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error while logging in' });
  } finally {
      await client.end();
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

app.post('/api/createEvent', async (req, res) => {
  const {
      name, category, description, time, date, location_name,
      latitude, longitude, contact_phone, contact_email, event_type,
      university_id, rso_id // rso_id can be optional depending on the event type
  } = req.body;

  // Basic validation to ensure required fields are provided
  if (!name || !category || !description || !time || !date || !location_name ||
      !latitude || !longitude || !contact_phone || !contact_email || !event_type || !university_id) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Connect to the database
  const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
  });

  try {
      await client.connect();
      const insertQuery = `
          INSERT INTO "Event" (name, category, description, time, date, location_name,
              latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *;
      `;
      const insertValues = [name, category, description, time, date, location_name,
          parseFloat(latitude), parseFloat(longitude), contact_phone, contact_email, event_type,
          university_id, rso_id || null];

      const result = await client.query(insertQuery, insertValues);
      // Modify the response to include a success message and the created event details
      res.json({
          message: "Event created successfully",
          event: result.rows[0]
      });
  } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Server error while creating event.' });
  } finally {
      await client.end();
  }
});

app.get('/api/eventList', async (req, res) => {
  // Assuming req.userId contains the authenticated user's ID
  const userId = req.userId; 

  // Connect to the database
  const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
  });

  try {
      await client.connect();
      
      // Retrieve the university_id for the authenticated user
      const userQuery = 'SELECT university_id FROM "User" WHERE user_id = $1;';
      const userResult = await client.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
          // No user found with the given ID (or not logged in)
          return res.status(404).json({ message: 'User not found or not logged in.' });
      }

      const universityId = userResult.rows[0].university_id;

      // Use the university_id to fetch the corresponding events
      const eventQuery = 'SELECT * FROM "Event" WHERE university_id = $1;';
      const eventResult = await client.query(eventQuery, [universityId]);
      res.json(eventResult.rows); // Send an array of events for the user's university
  } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Server error while fetching events.' });
  } finally {
      await client.end();
  }
});