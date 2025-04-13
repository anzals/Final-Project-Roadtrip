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
    const [showPast, setShowPast] = useState(false);

    // Ensure today is at midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort trips by date
    const validTrips = trips.filter(trip => trip.tripDate); // make sure tripDate exists
    const sortedTrips = [...validTrips].sort((a, b) => new Date(a.tripDate) - new Date(b.tripDate)
);

const upcomingTrips = sortedTrips.filter((trip) => {
    const tripDate = new Date(trip.tripDate);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate >= today;
});

const pastTrips = sortedTrips.filter((trip) => {
    const tripDate = new Date(trip.tripDate);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate < today;
});


    // Get user's first name
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
                    <p className="adventure-tag">Ready for your next adventure?</p>
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
                            <p>No upcoming trips. Plan one now!</p>
                        )}
                    </div>

                    {pastTrips.length > 0 && (
                        <div className="past-trips-toggle">
                            <button onClick={() => setShowPast(!showPast)}>
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
