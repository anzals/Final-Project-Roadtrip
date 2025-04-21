import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import api from "../api";
import "../styles/Trip.css"

function Trip({ trip, onDelete, currentUserId }) {
    const navigate = useNavigate();
    const formattedDate = new Date(trip.created_at).toLocaleDateString("en-UK");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tripDate = trip.trip_date ? new Date(trip.trip_date) : null;
    if (tripDate) tripDate.setHours(0, 0, 0, 0);

    // Format trip date or provide fallback if not available
    const formattedTripDate = trip.trip_date
        ? new Date(trip.trip_date).toLocaleDateString("en-UK", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "No date provided";

    // Handles routing
    const handleDetailsClick = () => {
        if (tripDate && tripDate < today) {
            navigate(`/trip/${trip.id}/summary`);
        } else if (trip.has_updated_route) {
            navigate(`/route/${trip.id}/update-route`);
        } else if (trip.has_route) {
            navigate(`/route/${trip.id}`);
        } else {
            navigate(`/trip/${trip.id}`);
        }
    };

    return (
        <div className="trips">
            <p className="trip-title">{trip.title}</p>
            <p className="trip-date">{formattedTripDate}</p>
            <div className="trip-route">
                <span className="route-start">{trip.start_location}</span>
                <span className="route-arrow">→</span>
                <span className="route-end">{trip.destination}</span>
            </div>
            <button className="details-button" onClick={handleDetailsClick}>
                See Details
            </button>
            {tripDate >= today ? (
                <button className="edit-button" onClick={() => navigate(`/trip/${trip.id}/edit`)}>
                    <FaEdit />
                </button>
            ) : (
            <button className="delete-past-trip-button" onClick={() => onDelete(trip.id)}>
                <FaTrash />
            </button>
            )}


        </div>
    );
}

export default Trip;
