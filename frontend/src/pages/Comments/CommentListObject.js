import React from "react";
import { useState, useEffect } from "react";

const CommentListObject = ({ comment_id, state, fetchComments }) => {

    const [comment, setComment] = useState({ user_id: -1, event_id: -1, comment_id: -1, comment: "" });
    const [modifiedComment, setModifiedComment] = useState("");
    const [modifying, setModifying] = useState(false);
    const [owner, setOwner] = useState(false);

    useEffect(() => {
        fetchComment();
    }, []);

    const fetchComment = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/fetch_comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment_id: comment_id }),
            });

            const data = await response.json();
            if (response.ok) {
                setComment(data);
                fetchCommentOwner(data.comment_id);
            } else {
                console.error("Error fetching comment:", data.error);
            }
        } catch (error) {
            console.error("Error fetching comment:", error);
        }
    }

    const modifyComment = async () => {

        console.log("Modifying comment to: ", modifiedComment);
        try {
            const response = await fetch("http://localhost:5000/api/modify_comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment_id, username: state.username, new_comment: modifiedComment }),
            });

            const data = await response.json();
            if (response.ok) {
                fetchComment();
            } else {
                console.error("Error modifying comment:", data.error);
            }
        } catch (error) {
            console.error("Error modifying comment:", error);
        }
    }

    const deleteComment = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/delete_comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment_id, username: state.username, comment: comment }),
            });

            const data = await response.json();
            if (response.ok) {
                fetchComments();
            } else {
                console.error("Error deleting comment:", data.error);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    }

    const fetchCommentOwner = async (new_comment_id) => {
        try {
            const response = await fetch("http://localhost:5000/api/fetch_comment_owner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment_id: new_comment_id, username: state.username }),
            });

            const data = await response.json();
            if (response.ok) {
                setOwner(data.owner);
            } else {
                console.error("Error fetching owner:", data.message);
            }
        } catch (error) {
            console.error("Error fetching owner:", error);
        }
    }

    const handleModify = () => {
        setModifying(!modifying);
    }

    console.log(state)
    console.log(comment)

    return (
        <div className="comment">
            <p>{comment.comment}</p>
            {modifying && (
                <div>
                    <input type="text" value={modifiedComment} onChange={(e) => setModifiedComment(e.target.value)} />
                    <button onClick={modifyComment}>Submit</button>
                </div>
            )}
            {owner &&
                <>
                    <button onClick={handleModify}>Modify</button>
                    <button onClick={deleteComment}>Delete</button>
                </>
            }
        </div>
    );
};

export default CommentListObject;