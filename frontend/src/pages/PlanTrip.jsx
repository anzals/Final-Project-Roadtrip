import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import.meta.env.VITE_GOOGLE_MAPS_API_KEY
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import api from "../api";
import Trip from "../components/Trip"
import "../styles/PlanTrip.css"

const libraries = ["places"];

function PlanTrip({ addTrip }) {
    const [title, setTitle] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [tripDate, setTripDate] = useState("");  
    const navigate = useNavigate();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (!isLoaded) return <div>Loading Google Maps...</div>;

    const createTrip = (e) => {
        e.preventDefault();
    
        const newTrip = { title, startLocation, destination, tripDate };
        
        api.post("/api/trips/", newTrip)
            .then((res) => {
                if (res.status === 201) {
                    alert("Trip created!");
                    addTrip(res.data); 
    
                    navigate(`/trip/${res.data.id}`);
                } else {
                    alert("Failed to create trip.");
                }
            })
            .catch((err) => alert(err));
    };
    

    const goToHome = () => {
        navigate("/");
    };

    
    return (
        <div className="plan-trip-container">
            <h2>Plan a Trip</h2>
            <p><em>Prepare yourself for a new adventure.</em></p>
            <form onSubmit={createTrip} className="">
                
                <input
                    type="text"
                    placeholder="Trip Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                
                <Autocomplete
                    options={{
                        componentRestrictions: { country: "gb" },
                      }}
                      onPlaceChanged={() =>
                        setStartLocation(document.querySelector("#startLocation").value)
                      }
                >
                    <input
                        id="startLocation"
                        type="text"
                        placeholder="Starting Location?"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        required
                    />
                </Autocomplete>
                
                <Autocomplete
                    options={{
                        componentRestrictions: { country: "gb" },
                      }}
                      onPlaceChanged={() =>
                        setDestination(document.querySelector("#destination").value)
                      }
                >
                    <input
                        id="destination"
                        type="text"
                        placeholder="Destination?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                    />
                </Autocomplete>
                
                <input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    required
                />
                <button type="submit" className="save-trip-button">
                    Save Trip
                </button>
            </form>
        </div>
    );
    
}

export default PlanTrip