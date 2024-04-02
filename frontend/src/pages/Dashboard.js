import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css'; // Ensure this is the path to your unified styles

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
    <div className="form-container"> {/* Reusing form-container for consistent padding and margin */}
      <h1 className="form-title">Dashboard</h1> {/* Reusing form-title for consistent text styling */}
      <p>Welcome to College Events, {username}!</p>
      <div>
        <button onClick={goToCreateUniversity} className="button">Create University</button>
        <button onClick={goToUniversityList} className="button">University List</button>
        <button onClick={goToCreateEvent} className="button">Create Event</button>
        <button onClick={goToEventList} className="button">Event Lists</button>
      </div>
      <button onClick={handleLogout} className="button">Logout</button>
    </div>
  );
};

export default Dashboard;
