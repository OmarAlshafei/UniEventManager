import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Register = () => {
  const app_name = "databasewebsite-8b9b09671d65";
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Add email state
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [message, setMessage] = useState('');

  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
      return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
      return "http://localhost:5000/" + route;
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, user_type: userType, university_id: universityId }),
      });
      if (response.ok) {
        setMessage('Successfully registered! You can now login.');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error during registration. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /> {/* Add email input field */}
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="User Type" value={userType} onChange={(e) => setUserType(e.target.value)} required />
        <input type="text" placeholder="University ID" value={universityId} onChange={(e) => setUniversityId(e.target.value)} required />
        <button type="submit">Register</button>
        {message && <p>{message}</p>}
      </form>
      {/* Add Link to the Login page */}
      <Link to="/login">Go to Login</Link>
    </div>
  );
};

export default Register;
