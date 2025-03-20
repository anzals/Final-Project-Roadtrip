import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Trip from "../components/Trip"
import "../styles/PlanTrip.css"

function PlanTrip({ addTrip }) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [tripCreated, setTripCreated] = useState(false);
    const navigate = useNavigate();

    const createTrip = (e) => {
        e.preventDefault();
    
        const newTrip = { content, title };
        
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
        <div className="">
            <h2 className="">Plan a New Trip</h2>
            <form onSubmit={createTrip} className="">
                <label className="block text-left">Trip Title:</label>
                <input
                    type="text"
                    className=""
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <label className="block text-left">Trip Details:</label>
                <textarea
                    className=""
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit" className="">
                    Save Trip
                </button>
            </form>
        </div>
    );
    
}

export default PlanTrip