import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import "../styles/TripSummary.css";

function TripSummary() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [route, setRoute] = useState(null);
    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const tripRes = await api.get(`/api/trips/${id}/`);
                setTrip(tripRes.data);

                const routeRes = await api.get(`/api/routes/${id}/`);
                setRoute(routeRes.data);

                const collabRes = await api.get(`/api/trip/${id}/collaborators/`);
                setCollaborators(collabRes.data.data.collaborators || []);
            } catch (err) {
                console.error("Error loading trip summary:", err);
            }
        };

        fetchTripData();
    }, [id]);

    const formatDate = (dateStr) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateStr).toLocaleDateString("en-UK", options);
    };

    if (!trip || !route) return <div>Loading summary...</div>;

    // If pitstops is a JSON string, parse it
    let pitstops = route.pitstops;
    if (typeof pitstops === "string") {
        try {
            pitstops = JSON.parse(pitstops);
        } catch {
            pitstops = [];
        }
    }

    return (
        <Layout>
            <div>
                <div className="trip-summary-page">
                    <h2>{trip.title || `Road Trip to ${trip.destination}`}</h2>
                    <p><strong>Date:</strong> {formatDate(trip.trip_date)}</p>
                    <p><strong>From:</strong> {trip.start_location}</p>
                    <p><strong>To:</strong> {trip.destination}</p>

                    {pitstops.length > 0 && (
                        <>
                            <h4>Pitstops:</h4>
                            <ul>
                                {pitstops.map((stop, index) => (
                                    <li key={index}>{stop}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    <p><strong>Distance:</strong> {route.distance}</p>
                    <p><strong>Duration:</strong> {route.duration}</p>

                    {collaborators.length > 0 && (
                        <>
                            {trip.author && (
                                <p><strong>Trip Owner:</strong> {trip.author.full_name || `${trip.author.first_name} ${trip.author.last_name}`} ({trip.author.email})</p>
                            )}
                            <h4>Collaborators:</h4>
                            <ul>
                                {collaborators.map(user => (
                                    <li key={user.id}>
                                        {user.first_name} {user.last_name} — {user.email}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="button-group">
                        <button onClick={() => window.print()}>Print Summary</button>
                        <button onClick={() => navigate("/")}>Back to Dashboard</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default TripSummary;
