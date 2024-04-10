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
    <div>
      <h2>RSO List</h2>
      {rsos.length > 0 ? (
        <ul>
          {rsos.map((rso) => (
            <RSOListObject
            key={rso.rso_id}
            rso_id={rso.rso_id}
            name={rso.name}
            state={location.state}
          />
          ))}
        </ul>
      ) : (
        <p>No RSOs found.</p>
      )}
    </div>
  );
};

export default RSOList;
