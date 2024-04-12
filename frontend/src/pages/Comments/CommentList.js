import React, { useState, useEffect } from 'react';
import CommentListObject from './CommentListObject';
import CommentCreate from './CommentCreate';

const CommentList = ({ event_id, state }) => {
    const [commentIds, setCommentIds] = useState([]);
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        fetchcommentIds();
    }, []);

    // Fetch commentIds from your Express API based on the event_id
    const fetchcommentIds = async () => {

        console.log("Fetching comment ids...");

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
                console.log(data.commentIds);
                setCommentIds(data.commentIds); // Update the commentIds state with the fetched data
            }
            else {
                console.error('Error fetching commentIds:', data.error);
            }
        } catch (error) {
            console.error('Error fetching commentIds:', error);
        }
    };

    const fetchRatings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/fetch_ratings',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: event_id }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                console.log(data.ratings);
                setRatings(data.ratings); // Update the ratings state with the fetched data
            }
            else {
                console.error('Error fetching ratings:', data.error);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    }

    return (
        <div>
            <h2>commentIds</h2>
            {commentIds.map(comment => (
                <CommentListObject key={comment.comment_id} comment_id={comment.comment_id} event_id={event_id} state={state} fetchComments={fetchcommentIds} />
            ))}
            <CommentCreate event_id={event_id} state={state} addComment={fetchcommentIds}/>
        </div>
    );
};

export default CommentList;
