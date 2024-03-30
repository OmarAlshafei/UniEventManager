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


// Create New User API endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, user_type, university_id } = req.body;
  
    // Check if all required fields are provided
    if (!username || !password || !user_type || !university_id) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
  
    // Connect to the PostgreSQL database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  
    try {
      await client.connect();
  
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Insert the user information into the "User" table
      const result = await client.query(
        'INSERT INTO "User" (username, password, user_type, university_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, hashedPassword, user_type, university_id]
      );
  
      // Exclude the password from the response
      const newUser = result.rows[0];
      delete newUser.password;
  
      // Respond with the newly created user
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

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    // Connect to the PostgreSQL database
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Query the database to find the user with the provided username
        const result = await client.query('SELECT * FROM "User" WHERE username = $1', [username]);
        const user = result.rows[0];

        // If user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the hashed password with the provided password
        const passwordMatch = await bcrypt.compare(password, user.password);

        // If passwords match, return success
        if (passwordMatch) {
            // Exclude password from the response
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


if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
