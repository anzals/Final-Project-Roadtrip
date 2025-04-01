import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleMap, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import api from "../api";

// Refresh access token
const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token found");

        const response = await api.post("/api/token/refresh/", {
            refresh: refreshToken,
        });

        localStorage.setItem("access_token", response.data.access);
        return response.data.access;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return null;
    }
};

const libraries = ["places"];
const containerStyle = {
    width: "100%",
    height: "500px",
};

function MapRoute() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [hasRoute, setHasRoute] = useState(false); // Track if route already exists

    const navigate = useNavigate();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

   // Check if the route for this trip is already saved when the page loads
    useEffect(() => {
        api.get(`/api/routes/${id}/`)
            .then((res) => {
                if (res.status === 200) {
                    setHasRoute(true); // Route exists
                } else {
                    setHasRoute(false); // Route does not exist
                }
            })
            .catch((err) => {
                console.error("Error checking route existence:", err);
                setHasRoute(false); // Route does not exist
            });
    }, [id]);
    
    

    // Fetch trip details
    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then((res) => {
                setTrip(res.data);
            })
            .catch((err) => {
                console.error("Error fetching trip:", err);
            });
    }, [id]);

    // Fetch directions for the trip
    useEffect(() => {
        if (trip && isLoaded) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: trip.startLocation,
                    destination: trip.destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK") {
                        setDirections(result);
                        const route = result.routes[0].legs[0];
                        setDistance(route.distance.text);
                        setDuration(route.duration.text);
                    } else {
                        console.error("Error calculating route:", status);
                    }
                }
            );
        }
    }, [trip, isLoaded]);

    // Save route to the database
    const saveRoute = () => {
        const newRoute = {
            trip: trip.id,
            startLocation: trip.startLocation,
            destination: trip.destination,
            distance,
            duration,
            routePath: JSON.stringify(directions.routes[0].overview_polyline),
        };

        console.log("Route Data:", newRoute);

        api.post("/api/routes/", newRoute)
            .then((res) => {
                if (res.status === 201 || res.status === 200) {
                    alert("Route saved successfully!");
                    setHasRoute(true); // Update state after saving
                    navigate("/"); // Redirect to dashboard
                } else {
                    alert("Failed to save route.");
                }
            })
            .catch((err) => {
                console.error("Error saving route:", err.response ? err.response.data : err.message);
                alert("Error saving route: " + (err.response ? JSON.stringify(err.response.data) : err.message));
            });
    };

    if (!isLoaded) return <div>Loading map...</div>;
    if (!trip) return <div>Loading trip details...</div>;

    return (
        <div>
            <h2>From: {trip.startLocation} </h2>
            <h2>To: {trip.destination}</h2>
            <p>Distance: {distance}</p>
            <p>Duration: {duration}</p>
            <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={7}
                center={{ lat: 51.509865, lng: -0.118092 }} // Default to London
            >
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
            {!hasRoute && ( // Only show the button if the route doesn't exist
                <button onClick={saveRoute}>
                    Save Route
                </button>
            )}
        </div>
    );
}

export default MapRoute;
