// EventListObject.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommentList from '../Comments/CommentList'; // Import the CommentList component
import './EventListObject.css';


const EventListObject = ({ event, state }) => {

  const location = useLocation();
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    checkIfJoined();
  }, []);

  const handleJoinLeaveClick = () => {
    if (isJoined) {
      leaveEvent();
    } else {
      joinEvent();
    }
  };


  const checkIfJoined = async () => {
    const response = await fetch('http://localhost:5000/api/event_joined',
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
    const response = await fetch('http://localhost:5000/api/join_event',
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
    const response = await fetch('http://localhost:5000/api/leave_event',
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
      {/* Create a section for comments here*/}
      <CommentList event_id={event.event_id} comment_ids={event.comment_ids} state={location.state} />
    </div>
  );
};

export default EventListObject;
