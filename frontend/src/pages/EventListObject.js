// EventListObject.js
import React, { useEffect, useState } from 'react';
import './EventListObject.css'; // Import CSS file for styling

const EventListObject = ({ event, state }) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinLeaveClick = () => {
    if (isJoined) {
      leaveEvent();
    } else {
      joinEvent();
    }
  };

  useEffect(() => {
    checkIfJoined();
  }, []); 

  const app_name = "databasewebsite-8b9b09671d65";

    const buildPath = (route) => {
        if (process.env.NODE_ENV === "production") {
            return `https://${app_name}.herokuapp.com/${route}`;
        } else {
            return `http://localhost:5000/${route}`;
        }
    }

    const checkIfJoined = async() => {
      const response = await fetch(buildPath('api/event_joined'),
          {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event_id: event.event_id, username: state.username }),
          });

      const data = await response.json();
      if (response.ok) {
          console.log("RSO joined status fetched successfully", data);
          setIsJoined(data.joined);
      } else {
          console.error('Error fetching RSO joined status:', data.error);
      }
  }

    const joinEvent = async () => {
        const response = await fetch(buildPath('api/join_event'),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: event.event_id, username: state.username }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("Event joined successfully", data);
            setIsJoined(true);
        } else {
            console.error('Error joining event:', data.error);
        }
    }

    const leaveEvent = async () => {
        const response = await fetch(buildPath('api/leave_event'),
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: event.event_id, username: state.username }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("Event left successfully", data);
            setIsJoined(false);
        } else {
            console.error('Error leaving event:', data.error);
        }
    }

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
        <button onClick={handleJoinLeaveClick}>
          {isJoined ? 'Leave Event' : 'Join Event'}
        </button>
      </div>
    </div>
  );
};

export default EventListObject;
