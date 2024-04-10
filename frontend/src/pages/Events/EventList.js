// EventList.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EventListObject from './EventListObject';

const EventList = () => {

  const location = useLocation();

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
    const response = await fetch('http://localhost:5000/api/public_events', 
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (response.ok) {
      setPublicEvents(data.public_events);
    }
    else {
      console.error('Error fetching public events:', data.error);
    }
  };

  const getPrivateEvents = async() => {
    const response = await fetch('http://localhost:5000/api/private_events',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ university_id: userUniversityId })
    });

    const data = await response.json();
    if (response.ok) {
      setPrivateEvents(data.private_events);
    }
    else {
      console.error('Error fetching private events:', data.error);
    }
  }

  const getRSOEvents = async() => {
    const response = await fetch('http://localhost:5000/api/rso_events',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: location.state?.username})
    });

    const data = await response.json();
    if (response.ok) {
      setRsoEvents(data.rso_events);
    }
    else {
      console.error('Error fetching RSO events:', data.error);
    }
  }

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