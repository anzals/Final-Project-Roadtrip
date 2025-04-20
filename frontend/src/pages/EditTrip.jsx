import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import AutocompleteInput from "../components/AutocompleteInput";
import api from "../api";
import Layout from "../components/Layout";
import "../styles/EditTrip.css";

function EditTrip() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [title, setTitle] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [tripDate, setTripDate] = useState("");
    const [setStartPlaceDetails] = useState(null);
    const [setDestinationPlaceDetails] = useState(null);
    const LIBRARIES = ["places"]; 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);


    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES, 
    });
    

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/api/trips/${id}/`);
                setTrip(res.data);
                setTitle(res.data.title);
                setStartLocation(res.data.start_location);
                setDestination(res.data.destination);
                setTripDate(res.data.trip_date);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch trip:", err);
            }
        };
        fetchTrip();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await api.patch(`/api/trips/${id}/`, {
                title,
                startLocation,
                destination,
                tripDate,
            });
            setMessage({ type: "success", text: "Trip updated successfully!" });
    
            // Check if the route exists
            try {
                await api.get(`/api/routes/by-trip/${id}/`);
                navigate(`/route/${id}/update-route`);
            } catch (routeError) {
                navigate(`/trip/${id}`);
            }
    
        } catch (err) {
            console.error("Failed to update trip:", err);
            alert("Error updating trip.");
        }
    };
    

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this trip? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/trips/delete/${id}/`);
            alert("Trip deleted.");
            navigate("/");
        } catch (err) {
            console.error("Error deleting trip:", err);
            alert("Failed to delete trip.");
        }
    };

    if (loading) return <div>Loading trip...</div>;

    return (
        <Layout>
            <div className="plan-trip-form">
                <h2>Edit Trip</h2>

                <label>Trip Title:</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />

                <label>Start Location:</label>
                <AutocompleteInput
                    id="startLocation"
                    placeholder="Starting Location?"
                    value={startLocation}
                    onChange={setStartLocation}
                    setPlaceDetails={setStartPlaceDetails}
                />
                
                <label>Destination:</label>
                <AutocompleteInput
                    id="destination"
                    placeholder="Destination?"
                    value={destination}
                    onChange={setDestination}
                    setPlaceDetails={setDestinationPlaceDetails}
                />

                <label>Trip Date:</label>
                <input
                type="date"
                value={tripDate}
                min={new Date().toISOString().split("T")[0]} //  restrict past dates
                onFocus={(e) => (e.target.min = new Date().toISOString().split("T")[0])} 
                onChange={(e) => setTripDate(e.target.value)}
                required
                title="Select a future date"
                />

                <div className="button-group">
                    <button onClick={handleUpdate}>Save Changes</button>
                    <button onClick={handleDelete} className="delete-button">Delete Trip</button>
                    <button onClick={() => navigate(-1)}>Cancel</button>
                </div>
            </div>
        </Layout>
    );
}

export default EditTrip;
