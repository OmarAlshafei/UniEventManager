import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles.css'; // Ensure this path is correct

const RSOCreate = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [selectedMemberUsernames, setSelectedMemberUsernames] = useState([]);
    const [allPossibleMembers, setAllPossibleMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // Fetch all possible members from the server
        async function fetchPossibleMembers() {
            try {
                const response = await fetch('http://localhost:5000/api/fetch_university_members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ university_id: location.state?.university_id }),
                });

                const data = await response.json();
                if (response.ok) {
                    setAllPossibleMembers(data.users);
                } else {
                    throw new Error(data.message || 'Failed to fetch members');
                }
            } catch (error) {
                console.error('Error fetching possible members:', error);
                setErrorMsg('Error fetching members. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchPossibleMembers();
    }, [location.state?.university_id]); // Add university_id as a dependency

    const handleSubmit = async (e) => {
        e.preventDefault();
        const member_ids = allPossibleMembers
            .filter(member => selectedMemberUsernames.includes(member.username))
            .map(member => member.user_id); // Map selected usernames to user_ids

        try {
            const response = await fetch('http://localhost:5000/api/create_rso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username: location.state?.username, member_ids }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create RSO');
            }
            // Handle success, e.g., show a success message or redirect
            alert('RSO Successfully created');
            navigate('/Dashboard', { state: location.state });
        } catch (error) {
            console.error('Error creating RSO:', error);
            setErrorMsg(error.message || 'Error creating RSO. Please try again.');
        }
    };

    const handleMemberSelect = (selected) => {
        if (!selectedMemberUsernames.includes(selected)) {
            setSelectedMemberUsernames([...selectedMemberUsernames, selected]);
        }
    };

    const handleDashboard = () => {
        navigate('/Dashboard', { state: location.state });
    }

    return (
        <div className="page-container">
          <div className='box'>
            <h2 className="form-title">Create RSO</h2>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-section">
                <label className="form-label" htmlFor="name">Name:</label>
                <input
                  className="input"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-section">
                <label className="form-label" htmlFor="members">Select Members:</label>
                <select
                  className="form-select"
                  id="members"
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  value="" // Reset select after each selection
                >
                  <option value="">Select a member</option>
                  {loading ? (
                    <option>Loading...</option>
                  ) : (
                    allPossibleMembers.map((member, index) => (
                      <option key={index} value={member.username}>
                        {member.username}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="form-section">
                <label className="form-label" htmlFor="selected-members">Selected Members:</label>
                <ul id="selected-members">
                  {selectedMemberUsernames.map((username, index) => (
                    <li key={index}>{username}</li>
                  ))}
                </ul>
              </div>
              <button className="button" type="submit">Create RSO</button>
              <button className="button" onClick={handleDashboard}>Back to Dashboard</button>
            </form>
          </div>
        </div>
      );      
};

export default RSOCreate;
