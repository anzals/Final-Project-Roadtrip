import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import MapDisplay from "../components/MapDisplay";
import RouteDetails from "../components/RouteDetails";

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

                setPitstops(Array.isArray(pitstopsData) ? pitstopsData : []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching trip/route:", err);
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);


    // Update route calculation with pitstops
    useEffect(() => {
        if (trip && isLoaded) {
            const waypoints = pitstops.map((stop) => ({
                location: stop,
                stopover: true,
            }));
            
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: trip.startLocation,
                    destination: trip.destination,
                    waypoints: waypoints,
                    optimizeWaypoints: true, // add pitstops so the route is optimised
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
    }, [trip, pitstops, isLoaded]);


    // Navigate to edit pitstops page
    const editPitstops = () => {
        navigate(`/route/${id}/add-pitstop`);
    };

    // Save the updated route
    const saveUpdatedRoute = async () => {
        try {
            const updatedRoute = {
                trip: trip.id,
                startLocation: trip.startLocation,
                destination: trip.destination,
                distance,
                duration,
                routePath: JSON.stringify(directions.routes[0].overview_polyline),
                pitstops: pitstops,  // Keep existing pitstops
            };
    
            const response = await api.patch(`/api/routes/${id}/update/`, updatedRoute, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                alert("Updated route saved!");
            } else {
                alert("Failed to save updated route.");
            }
        } catch (err) {
            console.error("Error saving updated route:", err);
            alert("Failed to save updated route.");
        }
    };    
    

    if (!isLoaded) return <div>Loading map...</div>;
    if (loading) return <div>Loading updated route...</div>;

    return (
        <div>
            <RouteDetails trip={trip} distance={distance} duration={duration} />
            <MapDisplay directions={directions} />
            <div>
                <button onClick={saveUpdatedRoute}>Save Updated Route</button>
                <button onClick={editPitstops}>Edit Pitstops</button>
                <button onClick={() => navigate("/")}>Back to Dashboard</button>
            </div>
        </div>
    );
}

export default UpdateRoute;
