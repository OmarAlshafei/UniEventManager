import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Login = () => {
  const app_name = "databasewebsite-8b9b09671d65";
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
      return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
      return "http://localhost:5000/" + route;
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data.user)
        console.log(data.message)
        navigate('/dashboard', { state: { username: data.user.username, userType: data.user.userType, university_id: data.user.university_id, email: data.user.email} });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Error logging in. Please try again later.');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Login</h2>
      <form className="form" onSubmit={handleLogin}>
        <input 
          type="text" 
          className="input" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
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
        <button type="submit" className="button">Login</button>
        <button type="button" className="button" onClick={() => navigate('/register')}>Need an account? Register</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
