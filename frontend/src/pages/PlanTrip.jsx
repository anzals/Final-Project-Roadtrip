import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Trip from "../components/Trip"
import "../styles/PlanTrip.css"

function PlanTrip({ addTrip }) {
    const [title, setTitle] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [tripDate, setTripDate] = useState("");  
    const navigate = useNavigate();

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
            
                <input
                    type="text"
                    placeholder="Starting Location?"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    required
                />
                
                <input
                    type="text"
                    placeholder="Destination?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                />
                
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