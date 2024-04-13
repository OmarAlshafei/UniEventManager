import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RSOListObject from './RSOListObject';

const RSOList = () => {

  const location = useLocation();

  const [rsos, setRSOs] = useState([]);

  useEffect(() => {
    getRsos();
  }, []);

  const getRsos = async () => {
    const response = await fetch('http://localhost:5000/api/get_university_rsos',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ university_id: location.state.university_id }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log("RSOs fetched successfully", data);
      setRSOs(data.rsos);
    } else {
      console.error('Error fetching RSOs:', data.error);
    }
  }

  return (
    <div className='rso-background'>
      <div className='rso-header'>
        Available RSOs
      </div>
      {rsos.length > 0 ? (
        <div className="rso-main">
          <div className="rso-container">
            {rsos.map((rso) => (
              <div className="rso-item" key={rso.rso_id}>
                <RSOListObject
                  rso_id={rso.rso_id}
                  name={rso.name}
                  state={location.state}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No RSOs found.</p>
      )}
    </div>
  );

};

export default RSOList;
