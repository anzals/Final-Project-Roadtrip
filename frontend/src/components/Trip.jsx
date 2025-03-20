import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "../styles/Trip.css"

function Trip({ trip, onDelete }) {
    const navigate = useNavigate();
    const formattedDate = new Date(trip.created_at).toLocaleDateString("en-UK")

    return (
        <div className="trips">
            <p className="trip-title">{trip.title}</p>
            {/*<p className="trip-content">{trip.content}</p>*/}
            <p className="trip-date">{formattedDate}</p>
            <button className="details-button" onClick={() => navigate(`/trip/${trip.id}`)}>
                See Details
            </button>
            <button className="delete-button" onClick={() => onDelete(trip.id)}>
                <FaTrash />
            </button>
        </div>
    );
}

export default Trip