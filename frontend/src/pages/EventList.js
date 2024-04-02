import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const app_name = "databasewebsite-8b9b09671d65";

  const userUniversityId = "1"; // Placeholder for user's university ID
  const userRsoIds = ["USER_RSO_ID_1", "USER_RSO_ID_2"]; // Placeholder for user's RSO memberships

  const buildPath = (route) => {
    if (process.env.NODE_ENV === "production") {
      return `https://${app_name}.herokuapp.com/${route}`;
    } else {
      return `http://localhost:5000/${route}`;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const publicEventsResponse = await fetch(buildPath('api/public_events'));
      const publicEventsData = await publicEventsResponse.json();

      // Combine these into one array for simplicity
      let combinedEvents = [...publicEventsData];

      // Fetch private events if user has a university ID
      if (userUniversityId) {
        const privateEventsResponse = await fetch(buildPath('api/private_events'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ university_id: userUniversityId })
        });
        const privateEventsData = await privateEventsResponse.json();
        combinedEvents = [...combinedEvents, ...privateEventsData];
      }

      // Fetch RSO events if user is part of any RSOs
      // Assuming an endpoint or logic to fetch these based on userRsoIds exists
      // This will require additional logic on your backend or here to filter correctly

      setEvents(combinedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Event List</h2>
      <ul>
        {events.map(event => (
          <li key={event.event_id}>
            <strong>Name:</strong> {event.name}<br />
            <strong>Category:</strong> {event.category}<br />
            <strong>Description:</strong> {event.description}<br />
            {/* Additional event details */}
          </li>
        ))}
      </ul>
      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
};

export default EventList;
