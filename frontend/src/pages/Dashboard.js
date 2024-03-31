import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // import useLocation

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // This hook allows you to access the state

  const username = location.state?.username; // Safely access the username passed via state

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/');
  };

  return React.createElement(
    'div', 
    null,
    React.createElement('h1', null, 'Dashboard'),
    React.createElement('p', null, `Welcome to College Events, ${username}!`), // Display the username
    React.createElement('button', { onClick: handleLogout }, 'Logout')
  );
};

export default Dashboard;
