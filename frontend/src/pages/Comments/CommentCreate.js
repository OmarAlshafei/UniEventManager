import React, { useState } from "react";

const CommentCreate = ({ event_id, state }) => {
    const [comment, setComment] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/create_comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id: event_id, username: state.username, comment: comment}),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Comment created successfully:", data);
            } else {
                console.error("Error creating comment:", data.error);
            }
        } catch (error) {
            console.error("Error creating comment:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Comment:
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default CommentCreate;