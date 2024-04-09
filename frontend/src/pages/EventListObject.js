// EventListObject.js
import React from 'react';
import './EventListObject.css'; // Import CSS file for styling

const EventListObject = ({ event }) => {
  return (
    <div className="event-container">
      <div className="event-details">
        <h3>{event.name}</h3>
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Location:</strong> {event.location_name}</p>
        <p><strong>Contact:</strong> {event.contact_phone}, {event.contact_email}</p>
      </div>
    </div>
  );
};

export default EventListObject;
