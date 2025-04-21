import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import CollaboratorManager from "../components/CollaboratorManager";
import Layout from "../components/Layout"
import "../styles/TripDetails.css";

function TripDetails() {
    const { id } = useParams(); // trip Id from URL
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null); // Current user Id
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch trip info
    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then((res) => {
                setTrip(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load trip details:", err);
                setError("Failed to load trip details.");
                setLoading(false);
            });
    }, [id]);

    // Get current user Id
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId));
        }
    }, []);

    if (loading) return <p>Loading trip details...</p>;
    if (error) return <p>{error}</p>;
    if (!trip || !trip.author) return <p>Loading trip info...</p>;

    return (
        <Layout>
            <>
            <div className="trip-details-wrapper">
                <div className="trip-details-container">
                    <h2 className="trip-title">{trip.title}</h2>
                    <p><strong>Start Location:</strong> {trip.start_location}</p>
                    <p><strong>Destination:</strong> {trip.destination}</p>
                    <p><strong>Trip Date:</strong> {trip.trip_date}</p>
                    <hr />

                    <CollaboratorManager
                        tripId={trip.id}
                        currentUserId={userId}
                        tripAuthorId={trip.author.id}
                    />
                    
                    <div className="trip-buttons">
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
            </div>
        </>
        </Layout>
    );
}

export default TripDetails;
