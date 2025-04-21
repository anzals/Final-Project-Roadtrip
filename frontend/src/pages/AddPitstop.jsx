// Code inspired by:
// Title: "How to use Google Maps API with React including Directions and Places Autocomplete"
// Author: Mafia Codes
// YouTube: https://www.youtube.com/watch?v=iP3DnhCUIsE

// Code inspired by:
// Title: Drag and Drop with @hello-pangea/dnd
// Source: https://github.com/hello-pangea/dnd/tree/main/docs/api
// Library: @hello-pangea/dnd (React drag-and-drop)
// Used for implementing the draggable and droppable pitstop list UI


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useLoadScript } from "@react-google-maps/api";
import api from "../api";
import MapDisplay from "../components/MapDisplay";
import AutocompleteInput from "../components/AutocompleteInput";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Layout from "../components/Layout";
import "../styles/AddPitstop.css"
import "../styles/MapDisplay.css";


const LIBRARIES = ["places"];

function AddPitstop() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pitstop, setPitstop] = useState("");
    const [selectedPitstops, setSelectedPitstops] = useState([]);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState(5); 
    const [suggestedPlaces, setSuggestedPlaces] = useState([]);
    const [hasReordered, setHasReordered] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [pitstopPlaceDetails, setPitstopPlaceDetails] = useState(null);

    // Loads Google Maps with the libraries
    const navigate = useNavigate();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    // Toggle cetegory filter
    const toggleCategory = (category) => {
        setCategoryFilters(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    
    // Fetches trip data on load
    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then((res) => setTrip(res.data))
            .catch((err) => console.error("Error fetching trip:", err));
    }, [id]);

    // Claculates the basic route between start location and destination
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
                    }
                }
            );
        }
    }, [trip, isLoaded]);

    // Loads previously saved pitstops from backend
    useEffect(() => {
        async function fetchPitstops() {
            try {
                const response = await api.get(`/api/routes/${id}/`);
                let pitstopsData = response.data.pitstops;
    
                if (typeof pitstopsData === "string") {
                    try {
                        pitstopsData = JSON.parse(pitstopsData);
                    } catch (err) {
                        console.error("Error parsing pitstops:", err);
                        pitstopsData = [];
                    }
                }
    
                setSelectedPitstops(Array.isArray(pitstopsData) ? pitstopsData : []);
            } catch (error) {
                console.error("Error fetching existing pitstops:", error);
            }
        }
        fetchPitstops();
    }, [id]);

    // Add a custom pitstop from autocomplete input
    const addPitstop = async () => {

        if (!pitstopPlaceDetails) {
            setErrorMessage("Please select a valid location from the suggestions.");
            return;
          }
        if (selectedPitstops.length >= 5) {
            setErrorMessage("You can only add up to 5 pitstops.");
            return;
          }          
        try {
            // Add the new pitstop to the existing ones
            const updatedPitstops = [...selectedPitstops, pitstop];
    
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: updatedPitstops,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                setSelectedPitstops(updatedPitstops);
                setPitstop("");
            }
        } catch (error) {
            console.error("Error adding pitstop:", error);
            setErrorMessage("Error adding pitstop.");
        }
    };

    // Maps categories to an emoji
    const categoryEmojis = {
        restaurant: "🍽️",
        lodging: "🏨",
        restroom: "🚻",
        gas_station: "⛽",
        charging_station: "🔌",
    };

    // Adds a pitstop from the nearby suggestion list
    const addSuggestedPitstop = async (place) => {
        const name = `${place.name} - ${place.vicinity}`;
        const label = place._category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()); // Format: "gas_station" → "Gas Station"
        const emoji = categoryEmojis[place._category] || "📍";
        const fullName = `${emoji} ${name}`;

        if (selectedPitstops.length >= 5) {
            setErrorMessage("You can only add up to 5 pitstops.");
            return;
          }

        try {
            const updatedPitstops = [...selectedPitstops, fullName];
    
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: updatedPitstops,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                setSelectedPitstops(updatedPitstops);
            }
        } catch (error) {
            console.error("Error adding suggested pitstop:", error);
            setErrorMessage("Error adding suggested pitstop.");
        }
    };
    
    // Removes a selected pitstop
    const removePitstop = async (pitstop) => {
        try {
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: selectedPitstops.filter(p => p !== pitstop),
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                setSelectedPitstops(selectedPitstops.filter(p => p !== pitstop));
            } else {
                setErrorMessage("Failed to remove pitstop.");
            }
        } catch (error) {
            console.error("Error removing pitstop:", error);
            setErrorMessage("Error removing pitstop.");
        }
    };

    // Handles drag-and-drop reordering of pitstops
    const handleDragEnd = (result) => {
        if (!result.destination) return;
    
        const updatedPitstops = Array.from(selectedPitstops);
        const [movedItem] = updatedPitstops.splice(result.source.index, 1);
        updatedPitstops.splice(result.destination.index, 0, movedItem);
    
        setSelectedPitstops(updatedPitstops);
        setHasReordered(true); // user manually reordered
    };
    

    // Update route with pitstops
    const updateRoute = async () => {
        if (!trip || !isLoaded) return;
    
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = selectedPitstops.map(stop => ({
            location: stop,
            stopover: true,
        }));
    
        directionsService.route(
            {
                origin: trip.start_location,
                destination: trip.destination,
                waypoints: waypoints,
                optimizeWaypoints: !hasReordered, // Only optimizes if user hasn't reordered
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            async (result, status) => {
                if (status === "OK") {
                    let finalPitstops = selectedPitstops;
    
                    if (!hasReordered) {
                        const optimizedOrder = result.routes[0].waypoint_order;
                        finalPitstops = optimizedOrder.map(i => selectedPitstops[i]);
                    }
    
                    try {
                        const response = await api.patch(`/api/routes/${id}/update/`, {
                            pitstops: finalPitstops,
                        }, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                            },
                        });
    
                        if (response.status === 200) {
                            setSuccessMessage("Route updated successfully!");
                            navigate(`/route/${id}/update-route`, { state: { reorderedPitstops: hasReordered ? finalPitstops : null } });
                        } else {
                            setErrorMessage("Failed to update route.");
                        }
                    } catch (error) {
                        console.error("Error updating route:", error);
                        setErrorMessage("Error updating route.");
                    }
                } else {
                    console.error("Error calculating route:", status);
                    setErrorMessage("Error calculating route.");
                }
            }
        );
    };
    
    // Uses Google Places API to find suggested pitstops near route 
    const searchNearbyPlaces = () => {
        if (!directions || !categoryFilters.length) return;

        setSuggestedPlaces([]);
    
        const path = directions.routes[0].overview_path;
        const sampledPoints = path.filter((_, index) => index % 20 === 0); // Every 20th point
    
        const service = new window.google.maps.places.PlacesService(document.createElement("div"));
        const allResults = [];
    
        let completedRequests = 0;
    
        sampledPoints.forEach((point) => {
            categoryFilters.forEach((type) => {
                const request = {
                    location: point,
                    radius: maxDistanceKm * 1000,
                    type: type,
                    rankBy: window.google.maps.places.RankBy.PROMINENCE // Prioritise popular places
                };
    
                service.nearbySearch(request, (results, status) => {
                    completedRequests++;
    
                    if (status === "OK" && results.length) {
                        const topResults = results
                        .filter(result => result.business_status === "OPERATIONAL")
                        .slice(0, 3)
                        .map(result => ({
                            ...result,
                            _category: type,
                        }));

                        allResults.push(...topResults);
                    }
                                         
                    // Once requests are finished group and update
                    if (completedRequests === sampledPoints.length * categoryFilters.length) {
                        const groupedByCategory = {};
                        allResults.forEach((result) => {
                            if (!groupedByCategory[result._category]) {
                                groupedByCategory[result._category] = [];
                            }
                            // avoid duplicates per category
                            if (!groupedByCategory[result._category].some(p => p.place_id === result.place_id)) {
                                groupedByCategory[result._category].push(result);
                            }
                        });
                        // Flatten into one array
                        const combined = Object.values(groupedByCategory).flat();
                        setSuggestedPlaces(combined);

                    }
                });
            });
        });
    };

    // Clear messages after 3 seconnds
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 3000); 
    
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);
    
    

    return (
        <Layout>
            <div className="add-pitstop-page">
                {successMessage && <div className="form-success">{successMessage}</div>}
                {errorMessage && <div className="form-error">{errorMessage}</div>}
                <div className="pitstop-layout">
                    <div className="pitstop-controls">
                        <h2>Add Pitstops</h2>
                        <div className="control-group">
                            <h4>Discover Nearby</h4>
                            <label className="filter-bubble restaurant">
                                <input type="checkbox" value="restaurant" checked={categoryFilters.includes("restaurant")} onChange={() => toggleCategory("restaurant")} />
                                <span className="filter-label-text">Restaurants</span>
                            </label>
                                
                            <label className="filter-bubble lodging">
                                <input type="checkbox" value="lodging" checked={categoryFilters.includes("lodging")} onChange={() => toggleCategory("lodging")} />
                                <span className="filter-label-text">Hotels</span>
                            </label>
                                
                            <label className="filter-bubble restroom">
                                <input type="checkbox" value="restroom" checked={categoryFilters.includes("restroom")} onChange={() => toggleCategory("restroom")} />
                                <span className="filter-label-text">Toilets</span>
                            </label>
                                
                            <label className="filter-bubble gas_station">
                                <input type="checkbox" value="gas_station" checked={categoryFilters.includes("gas_station")} onChange={() => toggleCategory("gas_station")} />
                                <span className="filter-label-text">Petrol Stations</span>
                            </label>
                                
                            <label className="filter-bubble charging_station">
                                <input type="checkbox" value="charging_station" checked={categoryFilters.includes("charging_station")} onChange={() => toggleCategory("charging_station")} />
                                <span className="filter-label-text">EV Chargers</span>
                            </label>
                        </div>

                        
                        <div className="control-group">
                            <label>Max Radius from Route (km):</label>
                            <input 
                                type="number" 
                                value={maxDistanceKm} 
                                onChange={(e) => {
                                    const val = Math.max(1, Math.min(Number(e.target.value), 20));
                                    setMaxDistanceKm(val);
                                  }} 
                                min="1" 
                                max="20" />
                            <button onClick={searchNearbyPlaces}>Find Pitstops</button>
                        </div>
                        
                        <div className="control-group">
                            <h4>Add a Custom Pitstop</h4>
                            <div className="search-row">
                                <AutocompleteInput
                                id="pitstop"
                                placeholder="Search..."
                                value={pitstop}
                                onChange={setPitstop}
                                setPlaceDetails={setPitstopPlaceDetails}
                                />
                                <button onClick={addPitstop}>+</button>
                            </div>
                        </div>
                        
                        <div className="control-group">
                            <h4>Selected Pitstops</h4>
                            <p>You can reorder the pitstops by drag and drop.</p>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="pitstops">
                                    {(provided) => (
                                        <ul className="pitstop-list" {...provided.droppableProps} ref={provided.innerRef}>
                                            {selectedPitstops.map((ps, index) => (
                                                <Draggable key={ps} draggableId={ps} index={index}>
                                                    {(provided) => (
                                                        <li
                                                        className="pitstop-item"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        >
                                                            {ps}
                                                            <button onClick={() => removePitstop(ps)}>x</button>
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        <button className="update-btn" onClick={updateRoute}>Update Route</button>
                    </div>
                    
                    <div className="pitstop-map">
                    <MapDisplay
                    directions={directions}
                    suggestedPlaces={suggestedPlaces}
                    onAddPitstop={addSuggestedPitstop}
                    categoryFilters={categoryFilters}
                    />
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default AddPitstop;
