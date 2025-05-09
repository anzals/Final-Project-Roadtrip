import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Trip from "../components/Trip";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/Home.css";

function Home({ trips, getTrips }) {
    const [firstName, setFirstName] = useState("");
    const [userId, setUserId] = useState(null);
    const [showPast, setShowPast] = useState(false); // toggle to show/hide past trips

    // Ensure today is at midnight for accurate categorisation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort trips by date
    const validTrips = trips.filter(trip => trip.trip_date); // make sure trip_date exists
    const sortedTrips = [...validTrips].sort((a, b) => new Date(a.trip_date) - new Date(b.trip_date));
    
    // Get trips that are upcoming
    const upcomingTrips = sortedTrips.filter((trip) => {
        const tripDate = new Date(trip.trip_date);
        tripDate.setHours(0, 0, 0, 0);
        return tripDate >= today;
    });

    // Get trips that have past
    const pastTrips = sortedTrips.filter((trip) => {
        const tripDate = new Date(trip.trip_date);
        tripDate.setHours(0, 0, 0, 0);
        return tripDate < today;
    });

    // Get user's info
    useEffect(() => {
        const storedName = localStorage.getItem("firstName");
        if (storedName) {
            setFirstName(storedName);
        } else {
            const fetchUserInfo = async () => {
                try {
                    const response = await api.get("/api/user/", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    });
                    setFirstName(response.data.first_name);
                    setUserId(response.data.id);
                    localStorage.setItem("firstName", response.data.first_name);
                    localStorage.setItem("userId", response.data.id);
                } catch (err) {
                    console.error("Error fetching user data", err);
                }
            };
            fetchUserInfo();
        }
    }, []);

    // Load trips
    useEffect(() => {
        getTrips();
    }, [getTrips]);

    // Delete trips by Id
    const deleteTrip = (id) => {
        api.delete(`/api/trips/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Trip deleted!");
                else alert("Failed to delete trip.");
                getTrips();
            })
            .catch((error) => alert(error));
    };

    return (
        <div>
            <Header />
            <div className="home-content">
                <div className="title-container">
                    <span className="introduction-text">Welcome back, {firstName}!</span>
                    <p className="adventure-tag">Ready for your next adventure, around the UK?</p>
                    <Link to="/plan-trip">
                        <button>+ Plan a Trip</button>
                    </Link>
                </div>

                <div className="planner">
                    <span className="upcoming-trips">Upcoming Trips</span>
                    <div className="trip-container">
                        {upcomingTrips.length > 0 ? (
                            upcomingTrips.map((trip) => (
                            <Trip trip={trip} key={trip.id} onDelete={deleteTrip} currentUserId={userId} />
                        ))
                    ) : (
                    <div className="no-trips-message">
                        <p>No upcoming trips. Plan one now!</p>
                    </div>
                )}

                    </div>

                    {pastTrips.length > 0 && (
                        <div className="past-trips-toggle">
                            <button className="toggle-past-btn" onClick={() => setShowPast(!showPast)}>
                                {showPast ? "Hide Past Trips" : "Show Past Trips"}
                            </button>
                            {showPast && (
                                <div className="trip-container">
                                    {pastTrips.map((trip) => (
                                        <Trip trip={trip} key={trip.id} onDelete={deleteTrip} currentUserId={userId} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Home;
