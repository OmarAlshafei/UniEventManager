import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './styles.css'; // Ensure this is the path to your unified styles

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  // Safely access the user data from the location state
  const username = location.state?.username;
  const userType = location.state?.userType;

  const handleLogout = () => {
    navigate('/');
  };

  // Navigate to different parts of the application
  const goToCreateUniversity = () => navigate('/UniCreate', { state: location.state });
  const goToUniversityList = () => navigate('/UniList', { state: location.state });
  const goToCreateEvent = () => navigate('/EventCreate', { state: location.state });
  const goToEventList = () => navigate('/EventList', { state: location.state });
  const goToCreateRSO = () => navigate('/RSOCreate', { state: location.state });
  const goToRSOList = () => navigate('/RSOList', { state: location.state });


  return (
    <div className="page-container"> {/* Reusing form-container for consistent padding and margin */}
      <div className='box'>
        {error && <p className="error-message">{error}</p>}
        <h1 className="form-title">Dashboard</h1> {/* Reusing form-title for consistent text styling */}
        <p>Welcome to College Events, {username}!</p>
        {(userType === 'super_admin') && (
          <>
            <button onClick={goToCreateUniversity} className="button">Create University</button>
            <button onClick={goToCreateRSO} className="button">Create RSO</button>
            <button onClick={goToCreateEvent} className="button">Create Event</button>
          </>
        )}
        {(userType === 'admin') && (
          <>
            <button onClick={goToCreateRSO} className="button">Create RSO</button>
            <button onClick={goToCreateEvent} className="button">Create Event</button>
          </>
        )}
        <button onClick={goToUniversityList} className="button">University List</button>
        <button onClick={goToEventList} className="button">Event Lists</button>
        <button onClick={goToRSOList} className="button">RSO List</button>
        <button onClick={handleLogout} className="button">Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
