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
  
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
