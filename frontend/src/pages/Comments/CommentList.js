import React, { useState, useEffect } from 'react';
import CommentListObject from './CommentListObject';
import CommentCreate from './CommentCreate';

const CommentList = ({ event_id, state }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchComments();
    }, []);

    // Fetch comments from your Express API based on the event_id
    const fetchComments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fetch_comments',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: event_id }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                setComments(data.comments); // Update the comments state with the fetched data
            }
            else {
                console.error('Error fetching comments:', data.error);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const addComment = (comment) => {
        setComments([...comments, comment]);
    }

    return (
        <div>
            <h2>Comments</h2>
            {comments.map(comment => (
                <CommentListObject key={comment.comment_id} comment={comment} />
                // Assuming CommentListObject takes a 'comment' prop
            ))}
            <CommentCreate event_id={event_id} state={state} />
        </div>
    );
};

export default CommentList;
