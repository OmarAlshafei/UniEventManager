import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RSOCreate.css'; // Import the CSS file

const RSOCreate = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const username = location.state?.username;

    console.log(location.state);

    const app_name = "databasewebsite-8b9b09671d65";

    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(buildPath('api/create_rso'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username }),
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
                <button className="Button" type="submit">Create RSO</button>
            </form>
        </div>
    );
};

export default RSOCreate;
