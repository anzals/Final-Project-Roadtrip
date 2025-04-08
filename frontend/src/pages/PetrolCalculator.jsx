import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import Header from '../components/Header';

function PetrolCalculator() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get distance from location state or default to 0
    const initialDistance = location.state?.distance || 0;

    const [fuelEfficiency, setFuelEfficiency] = useState(15); // Default mpg
    const [fuelPrice, setFuelPrice] = useState(1.50); // Default price per liter
    const [distance, setDistance] = useState(parseFloat(initialDistance));
    const [estimatedCost, setEstimatedCost] = useState(null);

    const calculateCost = () => {
        const distanceInMiles = distance * 0.621371; // Convert km to miles
        const gallons = distanceInMiles / fuelEfficiency;
        const cost = gallons * fuelPrice;
        setEstimatedCost(cost.toFixed(2));
    };
    

    return (
        <div className="petrol-calculator-page">
            <Header />
            <h2>Estimate Petrol Cost</h2>
            
            <label>Fuel Efficiency (mpg):</label>
            <input 
                type="number" 
                value={fuelEfficiency} 
                onChange={(e) => setFuelEfficiency(e.target.value)} 
            />

            <label>Fuel Price (£ per liter):</label>
            <input 
                type="number" 
                value={fuelPrice} 
                step="0.01" 
                onChange={(e) => setFuelPrice(e.target.value)} 
            />

            <p>Distance (km): {distance}</p>

            <button onClick={calculateCost}>Calculate</button>

            {estimatedCost && (
                <p>Estimated Cost: £{estimatedCost}</p>
            )}

            <button onClick={() => navigate(`/route/${id}/update-route`)}>Back to Route</button>
        </div>
    );
}

export default PetrolCalculator;
