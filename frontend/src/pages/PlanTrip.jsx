import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import api from "../api";
import "../styles/PlanTrip.css"
import AutocompleteInput from "../components/AutocompleteInput";
import Layout from "../components/Layout";

const LIBRARIES = ["places"];

function PlanTrip({ addTrip }) {
    const [title, setTitle] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [tripDate, setTripDate] = useState("");  
    const [startPlaceDetails, setStartPlaceDetails] = useState(null);
    const [destinationPlaceDetails, setDestinationPlaceDetails] = useState(null);
    const [formError, setFormError] = useState("");

    const navigate = useNavigate();

    // Load Google MAps API
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES, 
    });
    

    if (!isLoaded) return <div>Loading Google Maps...</div>;

    // Handles plan trip form submission
    const createTrip = (e) => {
        e.preventDefault();
        setFormError("");  // clear previous error

        // Ensures locations were selected from autocomplete
        if (!startPlaceDetails || !destinationPlaceDetails) {
            setFormError("Please select valid locations from the suggestions.");
            return;
        }

        // Format trip for backend
        const newTrip = {
            title,
            start_location: startPlaceDetails.formatted_address,
            destination: destinationPlaceDetails.formatted_address,
            trip_date: tripDate,
        };

        // Send trip data to the backend
        api.post("/api/trips/", newTrip)
            .then((res) => {
                if (res.status === 201) {
                    addTrip(res.data);  // Update frontend trip list
                    navigate(`/trip/${res.data.id}`); // Go to trip details page
                } else {
                    setFormError("Failed to create trip.");
                }
            })
            .catch((err) => {
                setFormError("An error occurred. Please try again.");
                console.error(err);
            });
    };

    
    return (
        <Layout>
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
                
                    <AutocompleteInput
                        id="startLocation"
                        placeholder="Starting Location?"
                        value={startLocation}
                        onChange={setStartLocation}
                        setPlaceDetails={setStartPlaceDetails}
                    />

                    <AutocompleteInput
                        id="destination"
                        placeholder="Destination?"
                        value={destination}
                        onChange={setDestination}
                        setPlaceDetails={setDestinationPlaceDetails}
                    />
                    
                    <div className="date-wrapper">
                        <input
                        type="date"
                        value={tripDate}
                        min={new Date().toISOString().split("T")[0]}
                        onFocus={(e) => (e.target.min = new Date().toISOString().split("T")[0])}
                        onChange={(e) => setTripDate(e.target.value)}
                        required
                        />
                        <small className="input-helper">Select the date your road trip begins.</small>
                    </div>
                    {formError && <div className="form-error">{formError}</div>}
                    <button type="submit" className="save-trip-button">
                        Save Trip
                    </button>
                </form>
            </div>
        </Layout>
    );
    
}

export default PlanTrip