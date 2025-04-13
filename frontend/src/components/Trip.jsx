import { useNavigate } from "react-router-dom";
import { FaRoute, FaTrash } from "react-icons/fa";
import "../styles/Trip.css"

function Trip({ trip, onDelete, currentUserId }) {
    const navigate = useNavigate();
    const formattedDate = new Date(trip.created_at).toLocaleDateString("en-UK")

    const formattedTripDate = trip.tripDate
        ? new Date(trip.tripDate).toLocaleDateString("en-UK", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "No date provided";

    const handleDetailsClick = () => {
        if (trip.has_updated_route) {
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
                <span className="route-start">{trip.startLocation}</span>
                <span className="route-arrow">→</span>
                <span className="route-end">{trip.destination}</span>
            </div>
            <button className="details-button" onClick={handleDetailsClick}>
                See Details
            </button>
            <button className="delete-button" onClick={() => onDelete(trip.id)}>
                <FaTrash />
            </button>
        </div>
    );
}

export default Trip