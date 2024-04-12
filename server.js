const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { cp } = require('fs');
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
    res.json({ message: 'Login successful', user: { username: user.username, userType: user.user_type, university_id: user.university_id, email: user.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error while logging in' });
  }
});

/////////////////////////////////// EVENTS ///////////////////////////////////

app.post('/api/create_event', async (req, res) => {
  const {
    name, category, description, time, date, location_name,
    latitude, longitude, contact_phone, contact_email, event_type,
    university_id, rso_id
  } = req.body;

  // Convert empty strings to null for integer fields
  const latitudeVal = latitude === '' ? null : parseFloat(latitude);
  const longitudeVal = longitude === '' ? null : parseFloat(longitude);
  const universityIdVal = university_id === '' ? null : parseInt(university_id, 10);
  const rsoIdVal = rso_id === '' ? null : parseInt(rso_id, 10);

  try {
    const result = await pool.query(
      'INSERT INTO "Event" (name, category, description, time, date, location_name, latitude, longitude, contact_phone, contact_email, event_type, university_id, rso_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;',
      [name, category, description, time, date, location_name, latitudeVal, longitudeVal, contact_phone, contact_email, event_type, universityIdVal, rsoIdVal]
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
    const public_events = result.rows;

    if (public_events.length === 0) {
      return res.json({ public_events: [] });
    }

    return res.json({ public_events: public_events });
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/private_events', async (req, res) => {
  const { university_id } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Event" WHERE event_type = \'private\' AND university_id = $1', [university_id]);
    const private_events = result.rows;

    if (private_events.length === 0) {
      return res.json({ private_events: [] });
    }

    return res.json({ private_events: private_events });
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Grab all events for RSOs
app.post('/api/rso_events', async (req, res) => {
  const { username } = req.body;
  try {
    // Get user_id from username
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const rsoResult = await pool.query('SELECT rso_id FROM "RSO" WHERE $1 = ANY(member_ids)', [user_id]);
    const user_rsos = rsoResult.rows.map(rso => rso.rso_id);

    if (user_rsos.length === 0) {
      return res.json({ rso_events: [] });
    }

    const eventResult = await pool.query('SELECT * FROM "Event" WHERE event_type = \'rso\' AND rso_id = ANY($1)', [user_rsos]);
    const rso_events = eventResult.rows;

    return res.json({ rso_events: rso_events });

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

app.post('/api/join_event', async (req, res) => {
  const { event_id, username } = req.body;

  try {
    // Get user_id from username
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    // Retrieve the event and its attendee_ids
    const eventResult = await pool.query('SELECT attendee_ids FROM "Event" WHERE event_id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure attendee_ids is treated as an empty array if null
    const attendeeIds = eventResult.rows[0].attendee_ids || [];

    // Check if user already in attendee_ids
    if (attendeeIds.includes(user_id)) {
      return res.status(400).json({ message: "User already joined the event" });
    }

    // Add user_id to attendee_ids
    const updateResult = await pool.query('UPDATE "Event" SET attendee_ids = array_append(attendee_ids, $1) WHERE event_id = $2 RETURNING *', [user_id, event_id]);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Failed to join event" });
    }

    res.json({ message: "Successfully joined the event", event: updateResult.rows[0] });
  } catch (err) {
    console.error('Error joining event:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/leave_event', async (req, res) => {
  const { event_id, username } = req.body;

  try {
    // Get user_id from username
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    // Retrieve the event and its attendee_ids
    const eventResult = await pool.query('SELECT attendee_ids FROM "Event" WHERE event_id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure attendee_ids is treated as an empty array if null
    const attendeeIds = eventResult.rows[0].attendee_ids || [];

    // Check if user already in attendee_ids
    if (!attendeeIds.includes(user_id)) {
      return res.status(400).json({ message: "User not in the event" });
    }

    // Remove user_id from attendee_ids
    const updateResult = await pool.query('UPDATE "Event" SET attendee_ids = array_remove(attendee_ids, $1) WHERE event_id = $2 RETURNING *', [user_id, event_id]);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Failed to leave event" });
    }

    res.json({ message: "Successfully left the event", event: updateResult.rows[0] });
  } catch (err) {
    console.error('Error leaving event:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/event_joined', async (req, res) => {
  const { event_id, username } = req.body;

  try {
    // Fetch the users user_id from their username
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const result = await pool.query('SELECT * FROM "Event" WHERE event_id = $1 AND $2 = ANY(attendee_ids)', [event_id, user_id]);
    const joined = result.rows.length > 0;

    res.json({ joined: joined });
  } catch (err) {
    console.error('Error checking event joined status:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


/////////////////////////////////// RSO ///////////////////////////////////

app.post('/api/create_rso', async (req, res) => {
  const { name, username, member_ids } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id, user_type, university_id FROM "User" WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.user_type !== 'admin' && user.user_type !== 'super_admin') {
      return res.status(403).json({ message: "Only admins can create RSOs" });
    }

    const rsoResult = await pool.query('SELECT rso_id FROM "RSO" WHERE name = $1 AND university_id = $2', [name, user.university_id]);
    if (rsoResult.rows.length > 0) {
      return res.status(400).json({ message: "RSO name already exists for this university" });
    }

    member_ids.push(user.user_id); // Add the admin user to the member_ids

    if (!member_ids || member_ids.length < 3) {
      return res.status(400).json({ message: "At least 3 additional members are required to create an RSO" });
    }

    const result = await pool.query(
      'INSERT INTO "RSO" (name, admin_user_id, university_id, member_ids) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, user.user_id, user.university_id, member_ids]
    );

    return res.json({ message: "RSO Successfully created", object: result.rows[0] });

  } catch (err) {
    console.error('Error creating RSO:', err);
    res.status(500).json({ message: 'Server error while creating RSO' });
  }
});

app.post('/api/join_rso', async (req, res) => {
  const { rso_id, username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const memberCheckResult = await pool.query('SELECT * FROM "RSO" WHERE rso_id = $1 AND $2 = ANY(member_ids)', [rso_id, user.user_id]);
    if (memberCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "User already a member of the RSO" });
    }

    const addMemberResult = await pool.query('UPDATE "RSO" SET member_ids = array_append(member_ids, $1) WHERE rso_id = $2 RETURNING *', [user.user_id, rso_id]);
    if (addMemberResult.rows.length === 0) {
      return res.status(404).json({ message: "RSO not found" });
    }

    return res.json({ message: "Successfully joined RSO" });
  } catch (err) {
    console.error('Error joining RSO:', err);
    res.status(500).json({ message: 'Server error while joining RSO' });
  }
});

app.post('/api/leave_rso', async (req, res) => {
  const { rso_id, username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const memberCheckResult = await pool.query('SELECT * FROM "RSO" WHERE rso_id = $1 AND $2 = ANY(member_ids)', [rso_id, user.user_id]);
    if (memberCheckResult.rows.length === 0) {
      return res.status(400).json({ message: "User not a member of the RSO" });
    }

    const removeMemberResult = await pool.query('UPDATE "RSO" SET member_ids = array_remove(member_ids, $1) WHERE rso_id = $2 RETURNING *', [user.user_id, rso_id]);
    if (removeMemberResult.rows.length === 0) {
      return res.status(404).json({ message: "RSO not found" });
    }

    return res.json({ message: "Successfully left RSO" });
  } catch (err) {
    console.error('Error leaving RSO:', err);
    res.status(500).json({ message: 'Server error while leaving RSO' });
  }
});

app.delete('/api/delete_rso', async (req, res) => {
  const { rso_id, username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id, user_type FROM "User" WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'super_admin')) {
      return res.status(403).json({ message: "Unauthorized: Only admins can delete RSOs" });
    }

    const rsoResult = await pool.query('DELETE FROM "RSO" WHERE rso_id = $1 AND admin_user_id = $2 RETURNING *', [rso_id, user.user_id]);
    if (rsoResult.rows.length === 0) {
      return res.status(404).json({ message: "RSO not found or you're not the admin" });
    }

    return res.json({ message: "RSO successfully deleted" });
  } catch (err) {
    console.error('Error deleting RSO:', err);
    res.status(500).json({ message: 'Server error while deleting RSO' });
  }
});

app.post('/api/get_rso_list', async (req, res) => {
  const { username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rsoResult = await pool.query('SELECT rso_id, name FROM "RSO" WHERE $1 = ANY(member_ids)', [user.user_id]);
    if (rsoResult.rows.length === 0) {
      return res.json({ message: "No RSOs found for this user" });
    }

    return res.json({ message: "RSOs retrieved successfully", rsos: rsoResult.rows });
  } catch (err) {
    console.error('Error retrieving RSO list:', err);
    res.status(500).json({ message: 'Server error while retrieving RSO list' });
  }
});

app.post('/api/get_university_rsos', async (req, res) => {
  const { university_id } = req.body;

  try {
    const result = await pool.query('SELECT rso_id, name FROM "RSO" WHERE university_id = $1', [university_id]);
    const rsos = result.rows;

    res.json({ rsos: rsos });
  } catch (err) {
    console.error('Error fetching university RSOs', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/rso_joined', async (req, res) => {

  const { rso_id, username } = req.body;

  try {
    // Fetch the users user_id from their username
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const result = await pool.query('SELECT * FROM "RSO" WHERE rso_id = $1 AND $2 = ANY(member_ids)', [rso_id, user_id]);
    const joined = result.rows.length > 0;

    res.json({ joined: joined });
  } catch (err) {
    console.error('Error checking RSO joined status:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////// USERS ///////////////////////////////////

// Return a list of users that attend the university listed in the parameter of the request
app.post('/api/fetch_university_members', async (req, res) => {
  const { university_id } = req.body;

  try {
    const result = await pool.query('SELECT user_id, username FROM "User" WHERE university_id = $1', [university_id]);
    const users = result.rows;

    res.json({ users: users });
  } catch (err) {
    console.error('Error fetching university members', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////// COMMENTS ///////////////////////////////////

app.post('/api/fetch_comments', async (req, res) => {
  const { event_id } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Comment" WHERE event_id = $1', [event_id]);

    if (result.rows.length === 0) {
      return res.json({ commentIds: [] });
    }

    return res.json({ commentIds: result.rows });

  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/fetch_comment', async (req, res) => {
  const { comment_id } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Comment" WHERE comment_id = $1', [comment_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error('Error fetching comment:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/fetch_comment_owner', async (req, res) => {
  const { comment_id, username } = req.body;

  console.log(comment_id, username);

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const commentResult = await pool.query('SELECT * FROM "Comment" WHERE comment_id = $1', [comment_id]);

    if (userResult.rows.length === 0 || commentResult.rows.length === 0 || userResult.rows[0].user_id !== commentResult.rows[0].user_id) {
      return res.status(403).json({ message: "Unauthorized or comment not found", owner: false});
    }

    return res.json({ message: "User is the owner of the comment", owner: true});

  } catch (err) {
    console.error('Error fetching comment owner:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/modify_comment', async (req, res) => {
  const { comment_id, username, new_comment } = req.body;

  console.log(comment_id, username, new_comment);

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const commentResult = await pool.query('SELECT * FROM "Comment" WHERE comment_id = $1', [comment_id]);

    if (userResult.rows.length === 0 || commentResult.rows.length === 0 || userResult.rows[0].user_id !== commentResult.rows[0].user_id) {
      return res.status(403).json({ message: "Unauthorized or comment not found" });
    }

    await pool.query('UPDATE "Comment" SET comment = $1 WHERE comment_id = $2', [new_comment, comment_id]);
    res.json({ message: "Comment successfully updated" });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/create_comment', async (req, res) => {
  const { event_id, username, comment } = req.body;

  try {
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ message: "Please provide a comment" });
    }
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    await pool.query('INSERT INTO "Comment" (user_id, event_id, comment) VALUES ($1, $2, $3)', [user_id, event_id, comment]);

    const newComment = await pool.query('SELECT * FROM "Comment" WHERE user_id = $1 AND event_id = $2 AND comment = $3', [user_id, event_id, comment]);

    res.json({ message: "Comment successfully created", comment: newComment.rows[0] });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/update_comment', async (req, res) => {
  const { comment_id, username, new_comment } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const commentResult = await pool.query('SELECT * FROM "Comment" WHERE comment_id = $1', [comment_id]);

    if (userResult.rows.length === 0 || commentResult.rows.length === 0 || userResult.rows[0].user_id !== commentResult.rows[0].user_id) {
      return res.status(403).json({ message: "Unauthorized or comment not found" });
    }

    await pool.query('UPDATE "Comment" SET comment = $1 WHERE comment_id = $2', [new_comment, comment_id]);
    res.json({ message: "Comment successfully updated" });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/delete_comment', async (req, res) => {
  const { comment_id, username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    const commentResult = await pool.query('SELECT * FROM "Comment" WHERE comment_id = $1', [comment_id]);

    if (userResult.rows.length === 0 || commentResult.rows.length === 0 || userResult.rows[0].user_id !== commentResult.rows[0].user_id) {
      return res.status(403).json({ message: "Unauthorized or comment not found" });
    }

    await pool.query('DELETE FROM "Comment" WHERE comment_id = $1', [comment_id]);
    res.json({ message: "Comment successfully deleted" });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////// RATINGS ///////////////////////////////////

app.post('/api/fetch_ratings', async (req, res) => {
  const { event_id } = req.body;

  try {

    // Grab the "Ratings" column from Events table
    const result = await pool.query('SELECT ratings FROM "Event" WHERE event_id = $1', [event_id]);

    // If there are no ratings, return an empty array
    if (result.rows.length === 0 || !result.rows[0].ratings) {
      return res.json({ ratings: [] });
    }

    // Return the ratings array
    return res.json({ ratings: result.rows[0].ratings });
  }
  catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/add_rating', async (req, res) => {
  const { event_id, username, rating } = req.body;

  try {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const eventResult = await pool.query('SELECT ratings FROM "Event" WHERE event_id = $1', [event_id]);

    console.log("Event result rows: ", eventResult.rows);

    let ratings = eventResult.rows[0] ? eventResult.rows[0].ratings : [];

    // Check if user has already rated the event
    const userRatingIndex = ratings.findIndex(r => r.user_id === user_id);
    if (userRatingIndex !== -1) {
      return res.status(400).json({ message: "User has already rated the event" });
    }

    const newRating = { score: rating, user_id: user_id };

    // Push new rating to ratings array
    ratings.push(newRating);

    // Update the ratings in the database
    await pool.query('UPDATE "Event" SET ratings = $1 WHERE event_id = $2', [ratings, event_id]);

    return res.json({ message: "Rating successfully added" });
  } catch (err) {
    console.error('Error adding rating:', err);
    res.status(500).json({ message: "Internal server error" });
  }

});

app.post('/api/fetch_user_rating', async (req, res) => {
  const { event_id, username } = req.body;

  try {
    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const eventResult = await pool.query('SELECT ratings FROM "Event" WHERE event_id = $1', [event_id]);
    const ratings = eventResult.rows[0].ratings || [];

    const userRating = ratings.find(r => r.user_id === user_id);

    if (!userRating) {
      return res.json({ rating: null });
    }

    return res.json({ rating: userRating.score });
  } catch (err) {
    console.error('Error fetching user rating:', err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/api/update_rating', async (req, res) => {
  const { event_id, username, rating } = req.body;

  try {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const userResult = await pool.query('SELECT user_id FROM "User" WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userResult.rows[0].user_id;

    const eventResult = await pool.query('SELECT ratings FROM "Event" WHERE event_id = $1', [event_id]);
    let ratings = eventResult.rows[0].ratings;

    const userRatingIndex = ratings.findIndex(r => r.user_id === user_id);
    if (userRatingIndex === -1) {
      return res.status(400).json({ message: "User has not rated the event" });
    }

    ratings[userRatingIndex].score = rating;

    await pool.query('UPDATE "Event" SET ratings = $1 WHERE event_id = $2', [ratings, event_id]);

    return res.json({ message: "Rating successfully updated" });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ message: "Internal server error" });
  }
});