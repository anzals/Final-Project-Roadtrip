import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import Header from "../components/Header";
import MapDisplay from "../components/MapDisplay";
import RouteDetails from "../components/RouteDetails";
import { metersToMiles } from "../utils/convert";
import "../styles/MapRoute.css";

const LIBRARIES = ["places"];

function MapRoute() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [hasRoute, setHasRoute] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    // Fetch trip details
    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then(res => setTrip(res.data))
            .catch(err => console.error("Error fetching trip:", err));
    }, [id]);

    // Check if route already saved
    useEffect(() => {
        if (!trip) return;

        api.get(`/api/routes/?trip=${trip.id}`)
            .then(res => {
                if (res.data?.length > 0) {
                    setHasRoute(true);
                    setSuccessMessage("Route already saved.");
                }
            })
            .catch(err => {
                console.error("Error checking route existence:", err);
                setHasRoute(false);
            });
    }, [trip]);

    useEffect(() => {
        if (successMessage) {
          const timer = setTimeout(() => {
            setSuccessMessage("");
          }, 4000);
          return () => clearTimeout(timer);
        }
      }, [successMessage]);
      

    // Fetch directions and save only if not already saved
    useEffect(() => {
        if (!trip || !isLoaded || hasRoute) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: trip.start_location,
                destination: trip.destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    const route = result.routes[0].legs[0];
                    setDirections(result);
                    
                    const distanceInMiles = metersToMiles(route.distance.value);
                    setDistance(`${distanceInMiles} mi`);
                    const durationInSeconds = route.duration.value;
                    const hours = Math.floor(durationInSeconds / 3600);
                    const minutes = Math.round((durationInSeconds % 3600) / 60);
                    setDuration(`${hours > 0 ? hours + " hrs " : ""}${minutes} mins`);


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
                        .then(res => {
                            if (res.status === 201 || res.status === 200) {
                                setSuccessMessage("Route saved successfully!");
                                setHasRoute(true);
                            }
                        })
                        .catch(err => {
                            console.error("Error saving route:", err);
                        });
                } else {
                    console.error("Error calculating route:", status);
                    setErrorMessage("Could not calculate route.");
                }
            }
        );
    }, [trip, isLoaded, hasRoute]);

    const navigateToAddPitstop = () => navigate(`/route/${id}/add-pitstop`);
    const goToDashboard = () => navigate("/");

    if (!isLoaded) return <div>Loading map...</div>;
    if (!trip) return <div>Loading trip details...</div>;

    return (
        <div className="map-route-page">
            <Header />

            <div className="message-container">
                {successMessage && <div className="form-success">{successMessage}</div>}
                {errorMessage && <div className="form-error">{errorMessage}</div>}
            </div>

            <div className="map-route-container">
                <div className="route-info-card">
                    <RouteDetails trip={trip} distance={distance} duration={duration} />
                    <div className="route-controls">
                        <button onClick={navigateToAddPitstop}>Add Pitstops</button>
                        <button onClick={goToDashboard}>Back to Dashboard</button>
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
