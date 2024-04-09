// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Make sure to import the CSS file

const Home = () => {

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="home-container">
      <div className="box">
        <h1>College Event Website</h1>
        <div className="buttons-container">

          <button onClick={handleLogin} className="button">Login</button>
          <button onClick={handleRegister} className="button">Register</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
