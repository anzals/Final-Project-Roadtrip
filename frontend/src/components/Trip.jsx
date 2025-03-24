import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "../styles/Trip.css"

function Trip({ trip, onDelete }) {
    const navigate = useNavigate();
    const formattedDate = new Date(trip.created_at).toLocaleDateString("en-UK")

    const formattedTripDate = trip.tripDate
        ? new Date(trip.tripDate).toLocaleDateString("en-UK", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "No date provided";

    return (
        <div className="trips">
            <p className="trip-title">{trip.title}</p>
            <p className="trip-date">{formattedTripDate}</p>
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