const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const saltRounds = 10;

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

// Middleware 
const isAdmin = async (req, res, next) => {
  const { admin_id } = req.body;
  
  try {
    const result = await pool.query('SELECT user_type FROM users WHERE user_id = $1', [admin_id]);
    var isAdmin = false;
    if(result.rows[0]?.user_type == "admin"){
      isAdmin = true;
    }
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can create events" });
    }
    
    next();
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const isSuperAdmin = async (req, res, next) => {
  const { superadmin_id } = req.body;
  
  try {
    const result = await pool.query('SELECT user_type FROM users WHERE user_id = $1', [superadmin_id]);
    var isAdmin = false;
    if(result.rows[0]?.user_type == "superAdmin"){
      isAdmin = true;
    }
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Only superAdmins can do this action" });
    }
    
    next();
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/////////////////////////////////// UNIVERSITY ///////////////////////////////////

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

/////////////////////////////////// LOGIN/REGISTER ///////////////////////////////////

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

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    try {
        const result = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Proceed with login success logic
        res.json({ message: 'Login successful', user: { username: user.username, userType: user.user_type } });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error while logging in' });
    }
});

/////////////////////////////////// EVENTS ///////////////////////////////////

app.post('/api/create_event', async (req, res) => {
  const { name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO "Event" (name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id]
    );
    const createdEvent = result.rows[0];
    res.json({ message: "Event created successfully", event: createdEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/public_events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Event" WHERE event_type = \'public\'');
    const events = result.rows;
    res.json(events);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/private_events', async (req, res) => {
  const { university_id } = req.body;
  // Ensure university_id is provided and is an integer
  if (!university_id || isNaN(parseInt(university_id))) {
    return res.status(400).json({ error: "University ID is required and must be a valid integer" });
  }

  try {
    const result = await pool.query('SELECT * FROM "Event" WHERE event_type = \'private\' AND university_id = $1', [university_id]);
    const events = result.rows;
    res.json(events);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/rso_events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Event" WHERE event_type = \'rso\'');
    const events = result.rows;
    res.json(events);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/get_event', async (req, res) => {
  const { event_id } = req.body; // Extract event_id from request body

  try {
    const result = await pool.query('SELECT * FROM "Event" WHERE event_id = $1', [event_id]);
    const event = result.rows[0];

    if (!event) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json(event);
    }
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/api/update_event/:event_id', async (req, res) => {
  const { event_id } = req.params;
  const { name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id } = req.body;

  try {
    const result = await pool.query('UPDATE "Event" SET name = $1, category = $2, description = $3, time = $4, date = $5, location_name = $6, latitude = $7, longitude = $8, contact_phone = $9, contact_email = $10, event_type = $11, university_id = $12, rso_id = $13 WHERE event_id = $14 RETURNING *',
      [name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id, event_id]);
    
    const updatedEvent = result.rows[0];

    if (!updatedEvent) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json({ message: "Event updated successfully", event: updatedEvent });
    }
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete('/api/delete_event/:event_id', async (req, res) => {

  const { event_id } = req.params;

  try {

    const result = await pool.query('DELETE FROM "Event" WHERE event_id = $1 RETURNING *', [event_id]);
    const deletedEvent = result.rows[0];

    if (!deletedEvent) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json({ message: "Event deleted successfully", event: deletedEvent });
    }
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////// RSO ///////////////////////////////////

// Add RSO (admin) - Only users from the proper university can create an RSO
app.post('/api/admin_rsos', isAdmin, async (req, res) => {
  const { admin_id, name, member_usernames } = req.body;

  try {
    await pool.query('BEGIN');

    // Retrieve user's university_id
    const userQuery = await pool.query('SELECT university_id FROM "User" WHERE user_id = $1', [admin_id]);
    const university_id = userQuery.rows[0]?.university_id;

    if (!university_id) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: "User not found or university_id not set" });
    }

    // Check if at least 4 members are provided
    if (!member_usernames || member_usernames.length < 3) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: "At least four members (including the admin) are required to create an RSO" });
    }

    // Create RSO
    const rsoResult = await pool.query('INSERT INTO RSO (university_id, admin_id, name) VALUES ($1, $2, $3) RETURNING rso_id',
      [university_id, admin_id, name]);
    const rsoId = rsoResult.rows[0].rso_id;

    // Add admin as a member
    await pool.query('INSERT INTO rso_memberships (rso_id, user_id) VALUES ($1, $2)', [rsoId, admin_id]);

    // Add other members
    for (const username of member_usernames) {
      const memberResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
      const memberId = memberResult.rows[0]?.user_id;
      if (memberId) {
        await pool.query('INSERT INTO rso_memberships (rso_id, user_id) VALUES ($1, $2)', [rsoId, memberId]);
      }
    }

    await pool.query('COMMIT');
    res.json({ message: "RSO created successfully", rso_id: rsoId });
  } catch (err) {
    console.error('Error creating RSO', err);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Internal server error" });
  }
});

// Join RSO - Only users from the proper university can join an RSO
app.post('/api/rsos/:rso_id/join', async (req, res) => {
  const { user_id } = req.body;
  const { rso_id } = req.params;

  try {
    // Retrieve user's university_id
    const userQuery = await pool.query('SELECT university_id FROM "User" WHERE user_id = $1', [user_id]);
    const university_id = userQuery.rows[0]?.university_id;

    if (!university_id) {
      return res.status(404).json({ error: "User not found or university_id not set" });
    }

    // Validate if rso_id exists
    const rsoQuery = await pool.query('SELECT COUNT(*) FROM RSO WHERE rso_id = $1', [rso_id]);
    const rsoExists = rsoQuery.rows[0].count > 0;
    if (!rsoExists) {
      return res.status(404).json({ error: "RSO not found" });
    }

    // Ensure user belongs to the same university as the RSO
    const membershipQuery = await pool.query('SELECT COUNT(*) FROM rso_memberships rm INNER JOIN RSO r ON rm.rso_id = r.rso_id WHERE rm.user_id = $1 AND r.university_id = $2',
      [user_id, university_id]);
    
    const isMemberOfSameUniversity = membershipQuery.rows[0].count;
    if (!isMemberOfSameUniversity) {
      return res.status(403).json({ error: "User does not belong to the same university as the RSO", isMemberOfSameUniversity});
    }

    await pool.query('INSERT INTO rso_memberships (rso_id, user_id) VALUES ($1, $2)',
      [rso_id, user_id]);

    res.json({ message: "Joined RSO successfully" });
  } catch (err) {
    console.error('Error joining RSO', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve RSO details
app.get('/api/rsos/:rso_id', async (req, res) => {
  const { rso_id } = req.params;

  try {
    const rsoQuery = await pool.query('SELECT * FROM RSO WHERE rso_id = $1', [rso_id]);
    const rso = rsoQuery.rows[0];

    if (!rso) {
      return res.status(404).json({ error: "RSO not found" });
    }

    const membersQuery = await pool.query('SELECT u.username FROM "User" u INNER JOIN rso_memberships m ON u.user_id = m.user_id WHERE m.rso_id = $1', [rso_id]);
    const members = membersQuery.rows.map(row => row.username);

    res.json({ ...rso, members });
  } catch (err) {
    console.error('Error retrieving RSO', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update RSO
app.put('/api/rsos/:rso_id', async (req, res) => {
  const { rso_id } = req.params;
  const { name } = req.body;

  try {
    // Validate if rso_id exists
    const rsoQuery = await pool.query('SELECT COUNT(*) FROM RSO WHERE rso_id = $1', [rso_id]);
    const rsoExists = rsoQuery.rows[0].count > 0;
    if (!rsoExists) {
      return res.status(404).json({ error: "RSO not found" });
    }

    await pool.query('UPDATE RSO SET name = $1 WHERE rso_id = $2', [name, rso_id]);

    res.json({ message: "RSO updated successfully" });
  } catch (err) {
    console.error('Error updating RSO', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete RSO
app.delete('/api/rsos/:rso_id', async (req, res) => {
  const { rso_id } = req.params;

  try {
    await pool.query('BEGIN');
    // Delete related memberships first
    await pool.query('DELETE FROM rso_memberships WHERE rso_id = $1', [rso_id]);

    // Then delete the RSO
    await pool.query('DELETE FROM RSO WHERE rso_id = $1', [rso_id]);

    await pool.query('COMMIT');
    res.json({ message: "RSO deleted successfully" });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error deleting RSO', err);
    res.status(500).json({ error: "Internal server error" });
  }
});