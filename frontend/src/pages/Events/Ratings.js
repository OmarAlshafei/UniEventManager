import React, { useEffect } from "react";
import { useState } from "react";

const Ratings = ({event_id, state}) => {

    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const average_rating = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;

    useEffect(() => {
        //fetch_ratings();
    }, []);

    const fetch_ratings = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/fetch_ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id: event_id }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log(data.ratings);
                setRatings(data.ratings); // Update the ratings state with the fetched data

                fetch_user_rating(data.ratings);
            } else {
                console.error("Error fetching ratings:", data.error);
            }
        } catch (error) {
            console.error("Error fetching ratings:", error);
        }
    }

    const fetch_user_rating = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/fetch_user_rating", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id: event_id, username: state.username }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log(data.rating);
                setUserRating(data.rating); // Update the userRating state with the fetched data
            } else {
                console.error("Error fetching user rating:", data.error);
            }
        }
        catch (error) {
            console.error("Error fetching user rating:", error);
        }
    }


    const add_rating = async(rating) => {
        try {
            const response = await fetch("http://localhost:5000/api/add_rating", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id: event_id, username: state.username, rating: rating }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserRating(rating);
                fetch_ratings(); // Fetch ratings again to update the ratings state
            } else {
                console.error("Error adding rating:", data.error);
            }
        } catch (error) {
            console.error("Error adding rating:", error);
        }
    }

    const handleRatingChange = (rating) => {
        if (rating !== userRating) {
            setUserRating(rating);
        }
    }

    return (
        <div>
            <div>
                {/* Use userRating to make one of the buttons highlight differently (physical display) from the other */}
                <button className={userRating === 1 ? "highlight" : ""} onClick={() => { handleRatingChange(1); add_rating(1); }}>1</button>
                <button className={userRating === 2 ? "highlight" : ""} onClick={() => { handleRatingChange(2); add_rating(2); }}>2</button>
                <button className={userRating === 3 ? "highlight" : ""} onClick={() => { handleRatingChange(3); add_rating(3); }}>3</button>
                <button className={userRating === 4 ? "highlight" : ""} onClick={() => { handleRatingChange(4); add_rating(4); }}>4</button>
                <button className={userRating === 5 ? "highlight" : ""} onClick={() => { handleRatingChange(5); add_rating(5); }}>5</button>
            </div>

            <div>
                <p>Average rating: {average_rating}</p>
                <p>Number of ratings: {ratings.length}</p>
            </div>
        </div>
    );
}

export default Ratings;