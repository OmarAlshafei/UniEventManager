import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RSOCreate.css'; // Import the CSS file

const RSOCreate = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [allPossibleMembers, setAllPossibleMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const app_name = "databasewebsite-8b9b09671d65";

    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    useEffect(() => {
        setUsername(location.state?.username);

        // Fetch all possible members from the server
        async function fetchPossibleMembers() {
            try {
                const response = await fetch(buildPath('api/fetch_university_members'),
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ university_id: location.state?.university_id}),
                    });
                const data = await response.json();
                setAllPossibleMembers(data.users);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching possible members:', error);
            }
        }

        fetchPossibleMembers();
    }, []); // Empty dependency array ensures that this effect runs only once when the component mounts

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(buildPath('api/create_rso'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, selectedMembers }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle success, e.g., show a success message
                console.log(data.message);
            } else {
                // Handle error response from the server
                console.error(data.message);
            }
        } catch (error) {
            // Handle network errors
            console.error('Network error:', error);
        }
    };

    const handleMemberSelect = (e) => {
        setSelectedMembers([...selectedMembers, e.target.value]);
    };

    return (
        <div className="Container">
            <h2 className="Title">Create RSO</h2>
            <form className="Form" onSubmit={handleSubmit}>
                <div className="FormGroup">
                    <label className="Label" htmlFor="name">Name:</label>
                    <input
                        className="Input"
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="FormGroup">
                    <label className="Label" htmlFor="members">Select Members:</label>
                    <select
                        className="Select"
                        id="members"
                        onChange={handleMemberSelect}
                        multiple
                    >
                        {loading ? (
                            <option>Loading...</option>
                        ) : (
                            allPossibleMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.username}
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <div className="FormGroup">
                    <label className="Label" htmlFor="selected-members">Selected Members:</label>
                    <ul id="selected-members">
                        {selectedMembers.map((memberId) => {
                            const member = allPossibleMembers.find((m) => m.id === memberId);
                            return (
                                <li key={memberId}>{member.username}</li>
                            );
                        })}
                    </ul>
                </div>
                <button className="Button" type="submit">Create RSO</button>
            </form>
        </div>
    );
};

export default RSOCreate;
