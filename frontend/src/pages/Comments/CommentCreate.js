import React, { useState } from "react";
import "../styles.css";

const CommentCreate = ({ event_id, state, addComment }) => {
    const [comment, setComment] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/create_comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id: event_id, username: state.username, comment: comment }),
            });

            const data = await response.json();
            if (response.ok) {
                addComment(); // Fetch comments again to update the comments state
            } else {
                console.error("Error creating comment:", data.error);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    return (
        <form className='top-to-bottom-container' onSubmit={handleSubmit}>
            <label>
                Comment:
            </label>
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    );
};

export default CommentCreate;