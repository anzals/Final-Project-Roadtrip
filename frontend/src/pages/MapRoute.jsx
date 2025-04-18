import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import Header from "../components/Header" 
import MapDisplay from "../components/MapDisplay";
import RouteDetails from "../components/RouteDetails";
import "../styles/MapRoute.css"

const LIBRARIES = ["places"];

function MapRoute() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [hasRoute, setHasRoute] = useState(false); 

    const navigate = useNavigate();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    //Check if the route for this trip is already saved when the page loads
    useEffect(() => {
        api.get(`/api/routes/?trip=${id}`)
            .then((res) => {
                // Check if the response contains any routes
                if (res.data && res.data.length > 0) {
                    setHasRoute(true);
                } else {
                    setHasRoute(false);
                }
            })
            .catch((err) => {
                console.error("Error checking route existence:", err);
                setHasRoute(false); 
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

    // Fetch directions for the trip and save automatically
    useEffect(() => {
        if (trip && isLoaded) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: trip.start_location,
                    destination: trip.destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK") {
                        setDirections(result);
                        const route = result.routes[0].legs[0];
                        setDistance(route.distance.text);
                        setDuration(route.duration.text);

                        // Save or update the route automatically
                        const newRoute = {
                            trip: trip.id,
                            start_location: trip.start_location,
                            destination: trip.destination,
                            distance: route.distance.text,
                            duration: route.duration.text,
                            route_path: JSON.stringify(result.routes[0].overview_polyline),
                        };

                        api.post("/api/routes/", newRoute, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                            },
                        })
                        .then((res) => {
                            if (res.status === 201 || res.status === 200) {
                                alert("Route saved successfully!");
                                setHasRoute(true);
                            } else {
                                alert("Failed to save route.");
                            }
                        })
                        .catch((err) => {
                            console.error("Error saving route:", err);
                            alert("Error saving route.");
                        });
                    } else {
                        console.error("Error calculating route:", status);
                    }
                }
            );
        }
    }, [trip, isLoaded]);


    // Navigation to the Add Pitstop page
    const navigateToAddPitstop = () => {
        if (trip && trip.id) {
            navigate(`/route/${id}/add-pitstop`);
        } else {
            alert("Trip ID not found!");
        }
    };

    // Go back to the dashboard
    const goToDashboard = () => {
        navigate("/");
    };

    if (!isLoaded) return <div>Loading map...</div>;
    if (!trip) return <div>Loading trip details...</div>;

    return (
        <div className="map-route-page">
            <Header />
            <div className="map-route-container">
                <div className="route-info-card">
                    <RouteDetails trip={trip} distance={distance} duration={duration} />
                    
                    <div className="route-controls">
                        <button onClick={navigateToAddPitstop}>Add Pitstops</button>

                        <button onClick={goToDashboard}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
                
                <div className="map-wrapper">
                    <MapDisplay directions={directions} />
                </div>
            </div>
        </div>

        );
    }

export default MapRoute;
