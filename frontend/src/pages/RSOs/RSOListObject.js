import React, { useEffect, useState } from 'react';
import './RSOListObject.css';

const RSOListObject = ({ rso_id, name, state }) => {

    const [joined, setJoined] = useState(false);

    useEffect(() => {
        checkIfJoined();
    }, []);

    const joinRSO = async () => {
        const response = await fetch('http://localhost:5000/api/join_rso',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rso_id: rso_id, username: state.username }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("RSO joined successfully", data);
            setJoined(true);
        } else {
            console.error('Error joining RSO:', data.error);
        }
    }

    const leaveRSO = async () => {
        const response = await fetch('http://localhost:5000/api/leave_rso',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rso_id: rso_id, username: state.username }),
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("RSO left successfully", data);
            setJoined(false);
        } else {
            console.error('Error leaving RSO:', data.error);
        }
    }

    const checkIfJoined = async() => {
        const response = await fetch('http://localhost:5000/api/rso_joined',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rso_id: rso_id, username: state.username }),
            });

        const data = await response.json();
        if (response.ok) {
            console.log("RSO joined status fetched successfully", data);
            setJoined(data.joined);
        } else {
            console.error('Error fetching RSO joined status:', data.error);
        }
    }

    const handleButtonClick = () => {
        if (joined) {
            leaveRSO();
        } else {
            joinRSO();
        }
    }

    return (
        <div className="rso-list-object">
            <h3>{name}</h3>
            <button onClick={handleButtonClick}>
                {joined ? 'Leave RSO' : 'Join RSO'}
            </button>
        </div>
    );
};

export default RSOListObject;
