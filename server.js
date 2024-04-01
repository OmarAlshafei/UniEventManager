const express = require('express');
const bcrypt = require('bcrypt'); // Ensure bcrypt is required for password hashing
const { Client } = require('pg'); // Ensure the pg Client is required
const bodyParser = require('body-parser');
const path = require('path'); // Required if you're serving files in production
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const saltRounds = 10; // Define salt rounds for bcrypt

// Port Configurations
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

// Add University API Endpoint
app.post('/api/adduniversity', async (req, res) => {
  const { name, location, description, num_students } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: 'Please provide both name and location of the university.' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query(
      'INSERT INTO "University" (name, location, description, num_students) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, location, description, num_students]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding new university:', err);
    res.status(500).json({ message: 'Server error while creating university' });
  } finally {
    await client.end();
  }
});

app.get('/api/universities', async (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT university_id, name FROM "University"');
    res.json(result.rows); // Send an array of objects with 'university_id' and 'name'
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ message: 'Failed to fetch universities. Please try again later.' });
  } finally {
    await client.end();
  }
});

// Create New User API endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password, user_type, university_id } = req.body;

  // Check if any required field is missing
  if (!username || !email || !password || !user_type) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // Check if email ends with '.edu' for non-super admin users
  if (user_type !== 'super admin' && !email.endsWith('.edu')) {
    return res.status(400).json({ message: 'Please provide a valid educational (.edu) email address.' });
  }

  // Super admins do not require a university_id
  if (user_type !== 'super admin' && !university_id) {
    return res.status(400).json({ message: 'Please provide university information.' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Check if the username already exists
    const userExistsResult = await client.query('SELECT * FROM "User" WHERE username = $1', [username]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists. Please choose another one.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userInsertQuery = 'INSERT INTO "User" (username, email, password, user_type, university_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const userInsertValues = [username, email, hashedPassword, user_type, user_type === 'super admin' ? null : university_id];

    const insertResult = await client.query(userInsertQuery, userInsertValues);
    const newUser = insertResult.rows[0];

    // Do not send the password hash back to the client
    delete newUser.password;
    res.json(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user.' });
  } finally {
    await client.end();
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

