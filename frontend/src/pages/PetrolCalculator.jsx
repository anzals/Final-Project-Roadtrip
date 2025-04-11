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

    const [numPassengers, setNumPassengers] = useState(1);
    const [excludeDriver, setExcludeDriver] = useState(false);
    const [manualShares, setManualShares] = useState([]);
    const [sharesEdited, setSharesEdited] = useState(false);


    const calculateCost = () => {
        const distanceInMiles = distance * 0.621371; // Convert km to miles
        const gallons = distanceInMiles / fuelEfficiency;
        const totalCost = gallons * fuelPrice;
        setEstimatedCost(totalCost.toFixed(2));
        autoDivideCost(totalCost);
    };

    const autoDivideCost = (total) => {
        const splitCount = excludeDriver ? numPassengers - 1 : numPassengers;
        if (splitCount <= 0) return;
    
        const share = (total / splitCount).toFixed(2);
    
        // Generate UI fields only for those paying
        const countToRender = splitCount;
        setManualShares(Array(countToRender).fill(share));
    };
    

    const handleManualShareChange = (index, value) => {
        const updated = [...manualShares];
        updated[index] = value;
        setManualShares(updated);
        setSharesEdited(true); // user has started editing
    };

    const manualTotal = manualShares.reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
    );
    
    const resetShares = () => {
        const splitCount = excludeDriver ? numPassengers - 1 : numPassengers;
        if (splitCount <= 0) return;
        const share = (estimatedCost / splitCount).toFixed(2);
        setManualShares(Array(splitCount).fill(share));
        setSharesEdited(false);
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

            <label>
                Number of People Sharing Cost (including driver):
            </label>
            <input
            type="number"
            min="1"
            value={numPassengers}
            onChange={(e) => setNumPassengers(Number(e.target.value))}
            />

            <label>
            <input
            type="checkbox"
            checked={excludeDriver}
            onChange={(e) => setExcludeDriver(e.target.checked)}
            />
            Exclude driver from cost sharing
            </label>

            <button onClick={calculateCost}>Calculate</button>

            {estimatedCost && (
                <div style={{ marginTop: "1rem" }}>
                    <h4>Total Estimated Cost: £{estimatedCost}</h4>
                    <h4>Cost Per Person:</h4>
                    <ul>
                        {manualShares.map((share, index) => (
                            <li key={index}>
                                Passenger {index + 1}:
                                £
                                <input
                                    type="number"
                                    step="0.01"
                                    value={share}
                                    onChange={(e) =>
                                        handleManualShareChange(index, e.target.value)
                                    }
                                />{" "}
                            </li>
                        ))}
                    </ul>
                    {sharesEdited && (
                        <>
                        <p>New total: £{manualTotal.toFixed(2)}</p>

                        {estimatedCost &&
                        manualTotal.toFixed(2) !== parseFloat(estimatedCost).toFixed(2) && (
                        <p style={{ color: "red" }}>
                            Warning: Total no longer matches estimated petrol cost (£{estimatedCost})
                        </p>
                        )}
                        
                        <button onClick={resetShares} style={{ marginTop: "0.5rem" }}>
                            Reset to Equal Split
                        </button>

                        </>
                    )}
                    </div>
            )}
            <button onClick={() => navigate(`/route/${id}/update-route`)}>Back to Route</button>
        </div>
    );
}

export default PetrolCalculator;
