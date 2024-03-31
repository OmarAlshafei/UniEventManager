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
  if (!username || !email || !password || !user_type || !university_id) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if email ends with '.edu'
  if (!email.endsWith('.edu')) {
    return res.status(400).json({ message: 'Please provide a valid educational (.edu) email address.' });
  }

  // Check if the username already exists
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "User" WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists. Please choose another one.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const insertResult = await client.query(
      'INSERT INTO "User" (username, email, password, user_type, university_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, hashedPassword, user_type, university_id]
    );
    const newUser = insertResult.rows[0];
    delete newUser.password;
    res.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
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

