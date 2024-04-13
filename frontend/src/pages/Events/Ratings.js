import React, { useEffect, useState } from "react";
import "../styles.css";

const Ratings = ({ event_id, username }) => {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [event_id]);

  const fetchRatings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/fetch_ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id }),
      });

      const data = await response.json();
      if (response.ok) {
        setRatings(data.ratings);
      } else {
        console.error("Error fetching ratings:", data.error);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const addRating = async (rating) => {
    try {
      const response = await fetch("http://localhost:5000/api/add_rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id, rating }),
      });

      const data = await response.json();
      if (response.ok) {
        setUserRating(rating);
        fetchRatings();
      } else {
        console.error("Error adding rating:", data.error);
      }
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  return (
    <div className="ratings-comments-box">
      <div className="ratings-header">Ratings</div>
      <div>
        <p>Average rating: {ratings.length ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1) : "No ratings yet"}</p>
        <p>Number of ratings: {ratings.length}</p>
        {[1, 2, 3, 4, 5].map((rate) => (
          <button key={rate}
            className={userRating === rate ? "highlight" : ""}
            onClick={() => addRating(rate)}>
            {rate}
          </button>
        ))}
      </div>
      <div>
      </div>
    </div>
  );
};

export default Ratings;
