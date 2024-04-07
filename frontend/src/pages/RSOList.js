import React from 'react';

const RSOList = ({ rsoList }) => {
  return (
    <div>
      <h2>RSO List</h2>
      {rsoList.length > 0 ? (
        <ul>
          {rsoList.map((rso) => (
            <li key={rso.rso_id}>
              <strong>Name:</strong> {rso.name} | <strong>University ID:</strong> {rso.university_id} | <strong>Admin User ID:</strong> {rso.admin_user_id}
              {/* Add other relevant fields here */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No RSOs found.</p>
      )}
    </div>
  );
};

export default RSOList;
