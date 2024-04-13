import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';

const EventCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const university_id = location.state?.university_id;
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
    university_id: university_id || '',
    rso_id: '',
  });

  const [rsoOptions, setRsoOptions] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getRSODropdownOptions();
  }, []);

  const getRSODropdownOptions = async () => {

    try {
      const response = await fetch('http://localhost:5000/api/get_rso_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: location.state?.username,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRsoOptions(data.rsos);
      } else {
        throw new Error(data.error || 'Failed to fetch RSOs');
      }

    } catch (error) {
      setError(error.message || 'Error creating event');
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
      const response = await fetch('http://localhost:5000/api/create_event', {
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
      navigate('/dashboard', { state: location.state });
    } catch (error) {
      setError(error.message || 'Error creating event');
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard', { state: location.state });
  }

  return (
    <div className="page-container">
    <div className="box">
      <h2 className="form-title">Create Event</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        {/* Name */}
        <div className="form-section">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        {/* Category */}
        <div className="form-section">
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
        <div className="form-section">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>

        {/* Date */}
        <div className="form-section">
          <label>Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        {/* Time */}
        <div className="form-section">
          <label>Time:</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>

        {/* Location Name */}
        <div className="form-section">
          <label>Location Name:</label>
          <input type="text" name="location_name" value={formData.location_name} onChange={handleChange} required />
        </div>

        {/* Latitude */}
        <div className="form-section">
          <label>Latitude:</label>
          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} />
        </div>

        {/* Longitude */}
        <div className="form-section">
          <label>Longitude:</label>
          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} />
        </div>

        {/* Contact Phone */}
        <div className="form-section">
          <label>Contact Phone:</label>
          <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
        </div>

        {/* Contact Email */}
        <div className="form-section">
          <label>Contact Email:</label>
          <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} required />
        </div>

        {/* Event Type */}
        <div className="form-section">
          <label>Event Type:</label>
          <select name="event_type" value={formData.event_type} onChange={handleChange} required>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="rso">RSO</option>
          </select>
        </div>

        {/* Conditional RSO ID Field */}
        {formData.event_type === 'rso' && (
          <div className="form-section">
            {/* Create a dropdown of RSOs using rsoOptions.map()*/}
            <label>RSO:</label>
            <select name="rso_id" value={formData.rso_id} onChange={handleChange} required>
              {rsoOptions.map((rso) => (
                <option key={rso.rso_id} value={rso.rso_id}>{rso.name}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="button">Create Event</button>
        <button onClick={() => handleDashboard()} className="button">Back to Dashboard</button>
      </form>
      </div>
    </div>
  );

};

export default EventCreate;
