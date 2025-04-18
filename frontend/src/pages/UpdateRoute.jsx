import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import MapDisplay from "../components/MapDisplay";
import Layout from "../components/Layout";
import "../styles/UpdateRoute.css";
import "../styles/MapDisplay.css";


const LIBRARIES = ["places"];

function UpdateRoute() {
    const { id} = useParams();  
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [legs, setLegs] = useState([]);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [pitstops, setPitstops] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
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
                if (routeRes.data.route_path) {
                    const decodedPath = JSON.parse(routeRes.data.route_path);
                    const directionsService = new window.google.maps.DirectionsService();
                    directionsService.route(
                        {
                            origin: tripRes.data.start_location,
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
                                setLegs(result.routes[0].legs);
                                const legs = result.routes[0].legs;
                                const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
                                const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
                                setDistance((totalDistance / 1000).toFixed(2) + " km");
                                const hours = Math.floor(totalDuration / 3600);
                                const minutes = Math.round((totalDuration % 3600) / 60);
                                const formattedDuration = `${hours > 0 ? hours + " hrs " : ""}${minutes} mins`;
                                setDuration(formattedDuration);

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
    const calculateRoute = () => {
        if (!trip || !isLoaded) return;
    
        const waypoints = pitstops.map((stop) => ({
            location: stop,
            stopover: true,
        }));
    
        const isReordered = !!location.state?.reorderedPitstops;
    
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: trip.start_location,
                destination: trip.destination,
                waypoints: waypoints,
                optimizeWaypoints: !isReordered,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    setDirections(result);
                    const legs = result.routes[0].legs;
                    setLegs(legs);
    
                    const totalDistance = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
                    const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0);
    
                    setDistance((totalDistance / 1000).toFixed(2) + " km");
    
                    const hours = Math.floor(totalDuration / 3600);
                    const minutes = Math.round((totalDuration % 3600) / 60);
                    setDuration(`${hours > 0 ? hours + " hrs " : ""}${minutes} mins`);
                } else {
                    console.error("Error calculating route:", status);
                }
            }
        );
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

    const renderLegs = () => {
        return legs.map((leg, index) => (
            <div key={index} className="segment">
                <p><strong>{leg.start_address}</strong> → <strong>{leg.end_address}</strong></p>
                <p className="segment-info">
                    Distance: {(leg.distance.value / 1000).toFixed(2)} km, Duration: {Math.round(leg.duration.value / 60)} mins
                </p>
            </div>
        ));
    };    

    // Navigate to edit pitstops page
    const editPitstops = () => {
        navigate(`/route/${id}/add-pitstop`);
    };

    
    

    if (!isLoaded) return <div>Loading map...</div>;
    if (loading) return <div>Loading updated route...</div>;

    return (
        <Layout>
          <div className="update-route-page">
            <div className="update-route-layout">
              <div className="route-summary-panel">
                <h2>{trip?.title}</h2>
                <h4 className="trip-subtitle">Road Trip to {trip?.destination?.split(",")[0]}</h4>
                {trip && directions && (
                  <div className="stops-timeline">
                    {[trip.start_location, ...pitstops, trip.destination].map((stop, index, arr) => (
                      <div key={index}>
                        <p className="stop-bubble">{stop}</p>
                        {index < arr.length - 1 && legs[index] && (
                          <div className="segment-info-line">
                            <div className="segment-info-text">
                              <span>Distance: {(legs[index].distance.value / 1000).toFixed(2)} km</span><br />
                              <span>Duration: {Math.round(legs[index].duration.value / 60)} mins</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
      
                <div className="totals-box">
                  <p><strong>Total Distance:</strong> {distance}</p>
                  <p><strong>Total Duration:</strong> {duration}</p>
                </div>
      
                <div className="route-buttons">
                  <button onClick={editPitstops}>Edit Pitstops</button>
                  <button onClick={() => navigate(`/route/${id}/petrol-calculator`, { state: { distance } })}>
                    Estimate Petrol Cost
                  </button>
                  <button className="collab-button" onClick={() => navigate(`/trip/${id}`)}>
                    Manage Collaborators
                  </button>
                  <button onClick={() => navigate("/")}>Back to Dashboard</button>
                </div>
              </div>
      
              <div className="route-map">
                <MapDisplay directions={directions} />
              </div>
            </div>
          </div>
        </Layout>
      );      
}

export default UpdateRoute;
