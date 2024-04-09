import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RSOListObject from './RSOListObject';

const RSOList = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [rsos, setRSOs] = useState([]);

  useEffect(() => {
    getRsos();
  }, []);

  const app_name = "databasewebsite-8b9b09671d65";

  const buildPath = (route) => {
    if (process.env.NODE_ENV === "production") {
      return `https://${app_name}.herokuapp.com/${route}`;
    } else {
      return `http://localhost:5000/${route}`;
    }
  };

  const getRsos = async () => {
    const response = await fetch(buildPath('api/get_university_rsos'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ university_id: location.state?.university_id }),
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

  console.log("RSOs:", rsos)

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
