import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import CollaboratorManager from "../components/CollaboratorManager";
import "../styles/TripDetails.css";

function TripDetails() {
    const { id } = useParams();
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
      


    useEffect(() => {
        console.log(`Fetching trip details for ID: ${id}`); 
    
        api.get(`/api/trips/${id}/`)  
            .then((res) => {
                console.log("Trip Data:", res.data); 
                setTrip(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load trip details:", err);
                setError("Failed to load trip details.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId));  // Ensure proper number conversion
        }
    }, []);
       
    
    if (loading) return <p>Loading trip details...</p>;
    if (error) return <p>{error}</p>;
    if (!trip || !trip.author) return <p>Loading trip info...</p>;



    return (
        <div className="trip-details-container">
            <h2 className="trip-title">{trip.title}</h2>
            <p>Start Location:{trip.startLocation}</p>
            <p>Destination:{trip.destination}</p>
            <p>Trip Date: {trip.tripDate}</p>

            {trip?.author && (
                <CollaboratorManager
                tripId={trip.id}
                currentUserId={userId}
                tripAuthorId={trip.author.id}
                />
            )}



            <div className="buttons">
            <button
            className="generate-route"
            onClick={() =>
                navigate(trip.has_route ? `/route/${trip.id}/update-route` : `/route/${trip.id}`)
            }
            >
                {trip.has_route ? "View Route" : "Generate Route"}
            </button>

                <button className="back-button" onClick={() => navigate("/")}>
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}

export default TripDetails;
