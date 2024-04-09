// EventList.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EventListObject from './EventListObject';

const EventList = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const app_name = "databasewebsite-8b9b09671d65";

  const buildPath = (route) => {
    if (process.env.NODE_ENV === "production") {
      return `https://${app_name}.herokuapp.com/${route}`;
    } else {
      return `http://localhost:5000/${route}`;
    }
  };

  // State to store events fetched from the database
  const [publicEvents, setPublicEvents] = useState([]);
  const [privateEvents, setPrivateEvents] = useState([]);
  const [rsoEvents, setRsoEvents] = useState([]);

  const userUniversityId = location.state?.university_id; // Placeholder for user's university ID

  // Function to fetch events from the database
  const fetchEvents = async () => {
    try {
      getPublicEvents();
      getPrivateEvents();
      getRSOEvents();
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // useEffect hook to fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, []); // Empty dependency array ensures the effect runs only once

  const getPublicEvents = async() => {
    const response = await fetch(buildPath('api/public_events'), 
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Public events fetched successfully", data);
      setPublicEvents(data.public_events);
    }
    else {
      console.error('Error fetching public events:', data.error);
    }
  };

  const getPrivateEvents = async() => {
    const response = await fetch(buildPath('api/private_events'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ university_id: userUniversityId })
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Private events fetched successfully", data)
      setPrivateEvents(data.private_events);
    }
    else {
      console.error('Error fetching private events:', data.error);
    }
  }

  const getRSOEvents = async() => {
    const response = await fetch(buildPath('api/rso_events'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: location.state?.username})
    });

    const data = await response.json();
    if (response.ok) {
      console.log("RSO events fetched successfully", data)
      setRsoEvents(data.rso_events);
    }
    else {
      console.error('Error fetching RSO events:', data.error);
    }
  }
  console.log(publicEvents);
  console.log(privateEvents);
  console.log(rsoEvents);

  return (
    <div>
      <h2>Public Events</h2>
      <ul>
        {publicEvents.map(event => (
          <EventListObject key={event.event_id} event={event} state={location.state}/>
        ))}
      </ul>
      <h2>Private Events</h2>
      <ul>
        {privateEvents.map(event => (
          <EventListObject key={event.event_id} event={event} state={location.state}/>
        ))}
      </ul>
      <h2>RSO Events</h2>
      <ul>
        {rsoEvents.map(event => (
          <EventListObject key={event.event_id} event={event} state={location.state}/>
        ))}
      </ul>
    </div>
  );
};

export default EventList;


/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css'; // Ensure CSS is correctly imported

const EventList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const app_name = "databasewebsite-8b9b09671d65";

  const userUniversityId = location.state?.university_id; // Placeholder for user's university ID
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

      let combinedEvents = [...publicEventsData];

      if (userUniversityId) {
        const privateEventsResponse = await fetch(buildPath('api/private_events'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ university_id: userUniversityId })
        });
        const privateEventsData = await privateEventsResponse.json();
        combinedEvents = [...combinedEvents, ...privateEventsData];
      }

      // Additional logic for fetching RSO events would go here

      setEvents(combinedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="form-container">Loading...</div>; // Use "form-container" for consistent loading style
  }

  if (error) {
    return <div className="form-container error-message">Error: {error}</div>; // Use "error-message" for consistent error style
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Event List</h2>
      <ul>
        {events.map(event => (
          <li key={event.event_id} className="form-section">
            <strong>Name:</strong> {event.name}<br />
            <strong>Category:</strong> {event.category}<br />
            <strong>Description:</strong> {event.description}<br />
            {/* Consider adding more event details with consistent class naming 
          </li>
        ))}
      </ul>
      <Link to="/dashboard" className="button">Back to Dashboard</Link>
    </div>
  );
}

export default EventList;
*/