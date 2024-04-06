import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './styles.css'; // Ensure this is the path to your unified styles

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [hasRSO, setHasRSO] = useState(false);

  const username = location.state?.username; // Safely access the username passed via state
  const userType = location.state?.userType; // Safely access the userType passed via state

  const handleLogout = () => {
    navigate('/');
  };

  const app_name = "databasewebsite-8b9b09671d65";

  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
      return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
      return "http://localhost:5000/" + route;
    }
  }

  // Navigate to different parts of the application
  const goToCreateUniversity = () => navigate('/UniCreate');
  const goToUniversityList = () => navigate('/UniList');
  const goToCreateEvent = () => navigate('/EventCreate');
  const goToEventList = () => navigate('/EventList');
  const goToCreateRSO = () => navigate('/RSOCreate');
  const goToRSOList = () => navigate('/RSOList');

  console.log(location.state.username)
  console.log(location.state.userType)

  const canCreateEvent = async (e) => {

      console.log("Checking if user has created an RSO")

      e.preventDefault();
      try {
        const response = await fetch(buildPath('api/checkRSO'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({username}),
        });

        const data = await response.json();
        if (response.ok) {
          console.log(data.message)
          setHasRSO(true);
        } else {
          setError(data.message || 'Validating RSO failed.');
          setHasRSO(false);
        }
      } catch (error) {
        setError('Error checking the users RSO. Please try again later.');
        setHasRSO(false);
      }
  }

  return (
    <div className="form-container"> {/* Reusing form-container for consistent padding and margin */}
      <h1 className="form-title">Dashboard</h1> {/* Reusing form-title for consistent text styling */}
      <p>Welcome to College Events, {username}!</p>
      <div>
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
      </div>
      <button onClick={handleLogout} className="button">Logout</button>
    </div>
  );
};

export default Dashboard;
