import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useLoadScript } from "@react-google-maps/api";
import api from "../api";
import Header from "../components/Header";
import MapDisplay from "../components/MapDisplay";
import AutocompleteInput from "../components/AutocompleteInput";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../styles/AddPitstop.css"


const libraries = ["places"];
const containerStyle = {
    width: "100%",
    height: "500px",
};

function AddPitstop() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [pitstop, setPitstop] = useState("");
    const [autocomplete, setAutocomplete] = useState(null);
    const [selectedPitstops, setSelectedPitstops] = useState([]);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState(5); 
    const [suggestedPlaces, setSuggestedPlaces] = useState([]);

    const navigate = useNavigate();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const toggleCategory = (category) => {
        setCategoryFilters(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    

    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then((res) => setTrip(res.data))
            .catch((err) => console.error("Error fetching trip:", err));
    }, [id]);

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
                    }
                }
            );
        }
    }, [trip, isLoaded]);

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
    

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
                setPitstop(place.formatted_address);
            }
        }
    };

    const addPitstop = async () => {
        if (!pitstop) return;
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
                alert("Pitstop added successfully!");
            }
        } catch (error) {
            console.error("Error adding pitstop:", error);
            alert("Error adding pitstop.");
        }
    };

    const addSuggestedPitstop = async (pitstopName) => {
        try {
            const updatedPitstops = [...selectedPitstops, pitstopName];
    
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: updatedPitstops,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                setSelectedPitstops(updatedPitstops);
                alert("Pitstop added successfully!");
            }
        } catch (error) {
            console.error("Error adding suggested pitstop:", error);
            alert("Error adding pitstop.");
        }
    };
    
    

    const removePitstop = async (pitstop) => {
        try {
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: selectedPitstops.filter(p => p !== pitstop),
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                setSelectedPitstops(selectedPitstops.filter(p => p !== pitstop));
                alert("Pitstop removed successfully!");
            } else {
                alert("Failed to remove pitstop.");
            }
        } catch (error) {
            console.error("Error removing pitstop:", error);
            alert("Error removing pitstop.");
        }
    };

    // Handle drag and drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const updatedPitstops = Array.from(selectedPitstops);
        const [movedItem] = updatedPitstops.splice(result.source.index, 1);
        updatedPitstops.splice(result.destination.index, 0, movedItem);

        setSelectedPitstops(updatedPitstops);
    };

    // Save reordered pitstops
    const saveReorderedPitstops = async () => {
        try {
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: pitstops,  // Save the newly reordered pitstops
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                alert("Pitstops reordered successfully!");
                navigate(`/route/${id}/update-route`, { state: { reorderedPitstops: pitstops } });
            } else {
                alert("Failed to save reordered pitstops.");
            }
        } catch (error) {
            console.error("Error saving reordered pitstops:", error);
        }
    };
    

    // Update route with pitstops
    const updateRoute = async () => {
        try {
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: selectedPitstops, 
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.status === 200) {
                alert("Route updated successfully!");
                navigate(`/route/${id}/update-route`);
            } else {
                alert("Failed to update route.");
            }
        } catch (error) {
            console.error("Error updating route:", error);
            alert("Error updating route.");
        }
    };

    const searchNearbyPlaces = () => {
        if (!directions || !categoryFilters.length) return;
    
        const path = directions.routes[0].overview_path;
        const sampledPoints = path.filter((_, index) => index % 10 === 0); // Every 10th point
    
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
                        const topResults = results.slice(0, 3); // Only show top 3 results
                        allResults.push(...topResults);
                      }                      
    
                    // Once all requests are complete, set the suggestedPlaces state
                    if (completedRequests === sampledPoints.length * categoryFilters.length) {
                        const unique = Array.from(new Map(allResults.map(p => [p.place_id, p])).values());
                        setSuggestedPlaces(unique);
                    }
                });
            });
        });
    };
    

    return (
        <div className="add-pitstop-page">
  <Header />

  <div className="pitstop-layout">
    {/* Left Column */}
    <div className="pitstop-controls">
      <h2>Add Pitstops</h2>

      <div className="control-group">
        <h4>Discover Nearby</h4>
        <label><input type="checkbox" value="restaurant" checked={categoryFilters.includes("restaurant")} onChange={() => toggleCategory("restaurant")} /> Restaurants</label>
        <label><input type="checkbox" value="lodging" checked={categoryFilters.includes("lodging")} onChange={() => toggleCategory("lodging")} /> Hotels</label>
        <label><input type="checkbox" value="restroom" checked={categoryFilters.includes("restroom")} onChange={() => toggleCategory("restroom")} /> Toilets</label>
      </div>

      <div className="control-group">
        <label>Max Radius from Route (km):</label>
        <input type="number" value={maxDistanceKm} onChange={(e) => setMaxDistanceKm(Number(e.target.value))} min="1" max="20" />
        <button onClick={searchNearbyPlaces}>Find Pitstops</button>
      </div>

      <div className="control-group">
        <h4>Add a Custom Pitstop</h4>
        <div className="search-row">
          <AutocompleteInput
            id="pitstop"
            placeholder="Search..."
            value={pitstop}
            onChange={(value) => setPitstop(value)}
          />
          <button onClick={addPitstop}>+</button>
        </div>
      </div>

      <div className="control-group">
        <h4>Selected Pitstops</h4>
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

    {/* Right Column */}
    <div className="pitstop-map">
      <MapDisplay
        directions={directions}
        suggestedPlaces={suggestedPlaces}
        onAddPitstop={addSuggestedPitstop}
      />
    </div>
  </div>
</div>

    );
}

export default AddPitstop;
