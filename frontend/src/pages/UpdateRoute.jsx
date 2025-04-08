import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import MapDisplay from "../components/MapDisplay";

const libraries = ["places"];
const containerStyle = {
    width: "100%",
    height: "500px",
};

function UpdateRoute() {
    const { id } = useParams();  // Fetch the trip ID from the URL
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [pitstops, setPitstops] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();


    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    // Fetch trip and route details
    useEffect(() => {
        async function fetchData() {
            try {
                const tripRes = await api.get(`/api/trips/${id}/`);
                setTrip(tripRes.data);
    
                const routeRes = await api.get(`/api/routes/${id}/`);
                let pitstopsData = routeRes.data.pitstops;
    
                if (typeof pitstopsData === "string") {
                    try {
                        pitstopsData = JSON.parse(pitstopsData);
                    } catch (err) {
                        console.error("Error parsing pitstops:", err);
                        pitstopsData = [];
                    }
                }
    
                // If reordered pitstops are passed through state, use them
                if (location.state?.reorderedPitstops) {
                    setPitstops(location.state.reorderedPitstops);
                } else {
                    setPitstops(Array.isArray(pitstopsData) ? pitstopsData : []);
                }
    
                // If a saved route path exists, use it
                if (routeRes.data.routePath) {
                    const decodedPath = JSON.parse(routeRes.data.routePath);
                    const directionsService = new window.google.maps.DirectionsService();
                    directionsService.route(
                        {
                            origin: tripRes.data.startLocation,
                            destination: tripRes.data.destination,
                            waypoints: pitstopsData.map((stop) => ({
                                location: stop,
                                stopover: true,
                            })),
                            travelMode: window.google.maps.TravelMode.DRIVING,
                        },
                        (result, status) => {
                            if (status === "OK") {
                                setDirections(result);
                                const legs = result.routes[0].legs;
                                const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
                                const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
                                setDistance((totalDistance / 1000).toFixed(2) + " km");
                                setDuration((totalDuration / 60).toFixed(0) + " mins");
                            } else {
                                console.error("Error calculating route from saved path:", status);
                            }
                        }
                    );
                } else {
                    // Calculate route if no saved path is available
                    calculateRoute();
                }
    
                setLoading(false);
            } catch (err) {
                console.error("Error fetching trip/route:", err);
                setLoading(false);
            }
        }
        fetchData();
    }, [id, location.state]);
    

    // Calculate route when trip or pitstops change
    useEffect(() => {
        if (trip && pitstops.length > 0 && isLoaded) {
            calculateRoute();
        }
    }, [trip, pitstops, isLoaded]);
    

    // Function to calculate the route and update distance and duration
    const calculateRoute = (startLocation, destination, pitstopsData) => {
        if (startLocation && destination && isLoaded) {
            const waypoints = pitstopsData.map((stop) => ({
                location: stop,
                stopover: true,
            }));
    
            const isReordered = location.state?.reorderedPitstops ? true : false;
    
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: startLocation,
                    destination: destination,
                    waypoints: waypoints,
                    optimizeWaypoints: !isReordered, // Only optimize if not reordered
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === "OK") {
                        setDirections(result);
                        const legs = result.routes[0].legs;
                        const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
                        const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
                        setDistance((totalDistance / 1000).toFixed(2));
                        setDuration((totalDuration / 60).toFixed(0));
                    } else {
                        console.error("Error calculating route:", status);
                    }
                }
            );
        }
    };
    
    

    useEffect(() => {
        if (trip && pitstops.length > 0 && isLoaded) {
            calculateRoute();
        }
    }, [trip, pitstops, isLoaded]);

    const renderPitstops = () => {
        return pitstops.map((stop, index) => (
            <p key={index} className="pitstop-item">{stop}</p>
        ));
    };


    // Navigate to edit pitstops page
    const editPitstops = () => {
        navigate(`/route/${id}/add-pitstop`);
    };

    
    

    if (!isLoaded) return <div>Loading map...</div>;
    if (loading) return <div>Loading updated route...</div>;

    return (
        <div>
            <div className="route-overview">
                <h2>{trip?.title}</h2>
                <h3>Route:</h3>
                <p>From: {trip?.startLocation}</p>
                {renderPitstops()}
                <p>To: {trip?.destination}</p>
                <p>Distance: {distance}</p>
                <p>Duration: {duration}</p>
            </div>

            <MapDisplay directions={directions} />
            <div>
                <button onClick={editPitstops}>Edit Pitstops</button>
                <button onClick={() => navigate(`/route/${id}/petrol-calculator`, { state: { distance } })}>
                    Estimate Petrol Cost
                </button>
                <button onClick={() => navigate("/")}>Back to Dashboard</button>
            </div>
        </div>
    );
}

export default UpdateRoute;
