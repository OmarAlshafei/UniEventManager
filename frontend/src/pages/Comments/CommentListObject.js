import React from "react";

const CommentListObject = ({ comment }) => {
    return (
        <div className="comment">
            <h3>{comment.username}</h3>
            <p>{comment.comment}</p>
        </div>
    );
};

export default CommentListObject;