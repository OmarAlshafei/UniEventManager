import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username; // Safely access the username passed via state

  const handleLogout = () => {
    navigate('/');
  };

  // Navigate to different parts of the application
  const goToCreateUniversity = () => navigate('/UniCreate');
  const goToUniversityList = () => navigate('/UniList');
  const goToCreateEvent = () => navigate('/EventCreate');
  const goToEventList = () => navigate('/EventList');

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to College Events, {username}!</p>
      <div>
        <button onClick={goToCreateUniversity}>Create University</button>
        <button onClick={goToUniversityList}>University List</button>
        <button onClick={goToCreateEvent}>Create Event</button>
        <button onClick={goToEventList}>Event Lists</button>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
