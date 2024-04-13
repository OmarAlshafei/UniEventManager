import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css'; // Ensure this is the correct path to your styles

const UniCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Define the app name based on your deployment.

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    num_students: '',
    abbrev: '', // Match API
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, location, description, num_students, abbrev } = formData;

    try {
      const response = await fetch('http://localhost:5000/api/adduniversity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, description, num_students: num_students || null, abbrev }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error creating university');
        return;
      }

      const data = await response.json();
      setSuccessMessage(`University created successfully. ID: ${data.id}`); // Assuming 'id' is returned
    } catch (error) {
      console.error('Error during university creation:', error);
      setError('Error during university creation. Please try again later.');
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard', { state: location.state });
  };

  return (
    <div className='page-container'>
      <div className='box'>
        <h2 className="form-title">Create University</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <label>Name:</label>
            <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-section">
            <label>Location:</label>
            <input type="text" name="location" className="input" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-section">
            <label>Description:</label>
            <textarea name="description" className="input" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-section">
            <label>Number of Students:</label>
            <input type="number" name="num_students" className="input" value={formData.num_students} onChange={handleChange} />
          </div>
          <div className="form-section">
            <label>Abbreviation:</label>
            <input type="text" name="abbrev" className="input" value={formData.abbrev} onChange={handleChange} required />
          </div>
          <button type="submit" className="button">Create University</button>
          <button className="button" onClick={handleDashboard}>Back to Dashboard</button>
        </form>
      </div>
    </div>
  );

};

export default UniCreate;
