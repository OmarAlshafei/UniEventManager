import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

const EventCreate = () => {
  const navigate = useNavigate();
  const app_name = "databasewebsite-8b9b09671d65";
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    date: '',
    time: '',
    location_name: '',
    latitude: '',
    longitude: '',
    contact_phone: '',
    contact_email: '',
    event_type: 'public', // Adjust based on your needs
    university_id: '',
    rso_id: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
      return `https://${app_name}.herokuapp.com/${route}`;
    } else {
      return `http://localhost:5000/${route}`;
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildPath('api/create_event'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude), // Ensure numeric
          longitude: parseFloat(formData.longitude), // Ensure numeric
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const data = await response.json();
      setSuccessMessage('Event created successfully. ID: ' + data.event.event_id); // Adapt based on actual response structure
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Error creating event');
    }
  };


  return (
    <div className="form-container">
      <h2 className="form-title">Create Event</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        {/* Name */}
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        {/* Category */}
        <div>
          <label>Category:</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Social">Social</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {/* Description */}
        <div>
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        
        {/* Date */}
        <div>
          <label>Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        
        {/* Time */}
        <div>
          <label>Time:</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>
        
        {/* Location Name */}
        <div>
          <label>Location Name:</label>
          <input type="text" name="location_name" value={formData.location_name} onChange={handleChange} required />
        </div>
        
        {/* Latitude */}
        <div>
          <label>Latitude:</label>
          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} />
        </div>
        
        {/* Longitude */}
        <div>
          <label>Longitude:</label>
          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} />
        </div>
        
        {/* Contact Phone */}
        <div>
          <label>Contact Phone:</label>
          <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
        </div>
        
        {/* Contact Email */}
        <div>
          <label>Contact Email:</label>
          <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} required />
        </div>
        
        {/* Event Type */}
        <div>
          <label>Event Type:</label>
          <select name="event_type" value={formData.event_type} onChange={handleChange} required>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="rso">RSO</option>
          </select>
        </div>
        
        {/* University ID */}
        <div>
          <label>University ID:</label>
          <input type="text" name="university_id" value={formData.university_id} onChange={handleChange} required />
        </div>
        
        {/* Conditional RSO ID Field */}
        {formData.event_type === 'rso' && (
          <div>
            <label>RSO ID:</label>
            <input type="text" name="rso_id" value={formData.rso_id} onChange={handleChange} required={formData.event_type === 'rso'} />
          </div>
        )}
        
        <button type="submit" className="button">Create Event</button>
        <Link to="/dashboard" className="button">Back to Dashboard</Link>
      </form>
    </div>
  );
};

export default EventCreate;
