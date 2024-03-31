import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './register.css'; // Import register.css

const Register = () => {
  const app_name = "databasewebsite-8b9b09671d65";
  const navigate = useNavigate(); // Hook for navigation
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <input type="text" className="register-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" className="register-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="register-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select className="register-input" value={userType} onChange={(e) => setUserType(e.target.value)} required>
          <option value="" disabled>Select User Type</option>
          <option value="super admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
        <input type="text" className="register-input" placeholder="University ID" value={universityId} onChange={(e) => setUniversityId(e.target.value)} required />
        <button type="submit" className="register-button">Register</button>
        <button type="button" className="register-button" onClick={() => navigate('/login')}>Already registered? Log in</button>
        {message && <p className="register-error">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
