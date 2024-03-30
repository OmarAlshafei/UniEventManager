// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Make sure to import the CSS file

const Home = () => {
  return (
    <div className="home-container">
      <div className="box">
        <h1>College Event Website</h1>
        <div className="buttons-container">
          <Link to="/login" className="button">Login</Link>
          <Link to="/register" className="button">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
