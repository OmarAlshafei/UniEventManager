import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, user_type: userType }),
      });
      if (response.ok) {
        setMessage('Successfully registered! You can now login.');
        navigate('/login');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('Error during registration. Please try again later.');
    }
  };

  return (
    <div className="page-container">
      <div className="box">
        <h2 className="form-title">Register</h2>
        <form className="form" onSubmit={handleRegister}>
          <input
            type="text"
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="input"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="" disabled>Select User Type</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
          <button type="submit" className="button">Register</button>
          <button type="button" className="button" onClick={() => navigate('/login')}>Already registered? Log in</button>
          {message && <p className="error-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
