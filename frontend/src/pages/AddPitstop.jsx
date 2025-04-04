import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useLoadScript, Autocomplete } from "@react-google-maps/api";
import api from "../api";
import Header from "../components/Header";
import MapDisplay from "../components/MapDisplay";
import AutocompleteInput from "../components/AutocompleteInput";

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

    const navigate = useNavigate();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

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

    return (
        <div className="add-pitstop-page">
            <Header />
            <div>
                <MapDisplay directions={directions} />
                <h2>Add Pitstops</h2>
                <div>
                    <label>Search: </label>
                    <AutocompleteInput />
                    <button onClick={addPitstop}>+</button>
                </div>
                <div>
                    <h3>Selected Pitstops:</h3>
                    {selectedPitstops.map((ps, index) => (
                        <div key={index} className="pitstop">
                            {ps} <button onClick={() => removePitstop(ps)}>x</button>
                        </div>
                    ))}
                </div>
                <button onClick={updateRoute}>Update Route</button>
            </div>
        </div>
    );
}

export default AddPitstop;
