import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';

const UniList = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {    
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/universities');
        if (!response.ok) {
          throw new Error('Error fetching universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleDashboard = () => {
    navigate('/dashboard', { state: location.state });
  }


  if (loading) {
    return <div className="form-container">Loading...</div>;
  }

  if (error) {
    return <div className="form-container error-message">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="form-title">Universities</h2>
        <ul>
          {universities.map(university => (
            <li key={university.university_id} className="form-section">
              <strong>Name:</strong> {university.name}<br />
            </li>
          ))}
        </ul>
        <button className="button" onClick={handleDashboard}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default UniList;
