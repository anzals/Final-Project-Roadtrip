import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import fuelData from '../data/fuelData.json';

import Header from '../components/Header';
import '../styles/PetrolCalculator.css';

function PetrolCalculator() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialDistance = location.state?.distance || 0;

    const [fuelEfficiency, setFuelEfficiency] = useState('');
    const [fuelPrice, setFuelPrice] = useState('');
    const [distance, setDistance] = useState(parseFloat(initialDistance));
    const [estimatedCost, setEstimatedCost] = useState(null);

    const [numPassengers, setNumPassengers] = useState(1);
    const [excludeDriver, setExcludeDriver] = useState(false);
    const [manualShares, setManualShares] = useState([]);
    const [sharesEdited, setSharesEdited] = useState(false);

    const [selectedMake, setSelectedMake] = useState('');
    const [selectedFuelType, setSelectedFuelType] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [manualEntry, setManualEntry] = useState(false);

    const normaliseFuelType = (type) => {
        const lower = type.toLowerCase();
        if (lower.includes('electric') && lower.includes('petrol')) return 'Hybrid';
        if (lower.includes('electricity') && lower.includes('petrol')) return 'Hybrid';
        if (lower.includes('electric')) return 'Electric';
        if (lower.includes('diesel')) return 'Diesel';
        if (lower.includes('petrol')) return 'Petrol';
        return type;
    };

    const validCars = fuelData
        .filter(car => car["WLTP Imperial Combined"] > 0)
        .map(car => ({
            ...car,
            normalizedFuel: normaliseFuelType(car["Fuel Type"])
        }));

    const makes = [...new Set(validCars.map(car => car.Manufacturer))];
    const fuelTypes = [...new Set(validCars
        .filter(car => car.Manufacturer === selectedMake)
        .map(car => car.normalizedFuel))];

    const models = validCars
        .filter(car => car.Manufacturer === selectedMake && car.normalizedFuel === selectedFuelType);

    const calculateCost = () => {
        if (!fuelEfficiency || fuelEfficiency <= 0) {
            alert("Please select a valid car with fuel efficiency.");
            return;
        }
        const distanceInMiles = distance * 0.621371;
        const gallons = distanceInMiles / fuelEfficiency;
        const totalCost = gallons * fuelPrice;
        setEstimatedCost(totalCost.toFixed(2));
        autoDivideCost(totalCost);
    };

    const autoDivideCost = (total) => {
        const splitCount = excludeDriver ? numPassengers - 1 : numPassengers;
        if (splitCount <= 0) return;
        const share = (total / splitCount).toFixed(2);
        setManualShares(Array(splitCount).fill(share));
    };

    const handleManualShareChange = (index, value) => {
        const updated = [...manualShares];
        updated[index] = value;
        setManualShares(updated);
        setSharesEdited(true);
    };

    const manualTotal = manualShares.reduce((sum, val) => sum + parseFloat(val || 0), 0);

    const resetShares = () => {
        const splitCount = excludeDriver ? numPassengers - 1 : numPassengers;
        if (splitCount <= 0) return;
        const share = (estimatedCost / splitCount).toFixed(2);
        setManualShares(Array(splitCount).fill(share));
        setSharesEdited(false);
    };

    return (
        <div className="petrol-calculator-page">
            <h2 className="trip-title">Estimate Petrol Cost</h2>

            <label>Car Make:</label>
            {!manualEntry ? (
                <select
                    value={selectedMake}
                    onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedFuelType('');
                        setSelectedModel('');
                        setFuelEfficiency('');
                    }}
                >
                    <option value="">Select Make</option>
                    {makes.map((make, index) => (
                        <option key={index} value={make}>{make}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                />
            )}
            
            <div className="inline-checkbox">
                <input
                type="checkbox"
                checked={manualEntry}
                onChange={() => {
                    setManualEntry(!manualEntry);
                    setSelectedMake('');
                    setSelectedFuelType('');
                    setSelectedModel('');
                    setFuelEfficiency('');
                }}
                id="manualToggle"
                />
                <span>Can't find your car? Enter details manually</span>
            </div>


            {!manualEntry ? (
                <>
                    {selectedMake && (
                        <>
                            <label>Fuel Type:</label>
                            <select
                                value={selectedFuelType}
                                onChange={(e) => {
                                    setSelectedFuelType(e.target.value);
                                    setSelectedModel('');
                                    setFuelEfficiency('');
                                }}
                            >
                                <option value="">Select Fuel Type</option>
                                {fuelTypes.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {selectedMake && selectedFuelType && (
                        <>
                            <label>Car Model:</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => {
                                    setSelectedModel(e.target.value);
                                    const match = models.find(car => car.Model === e.target.value);
                                    if (match) {
                                        setFuelEfficiency(match["WLTP Imperial Combined"]);
                                    }
                                }}
                            >
                                <option value="">Select Model</option>
                                {[...new Set(models.map(car => car.Model))].map((model, index) => (
                                    <option key={index} value={model}>{model}</option>
                                ))}
                            </select>
                        </>
                    )}
                </>
            ) : (
                <>
                    <label>Fuel Type:</label>
                    <input
                        type="text"
                        value={selectedFuelType}
                        onChange={(e) => setSelectedFuelType(e.target.value)}
                    />

                    <label>Car Model:</label>
                    <input
                        type="text"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                    />
                </>
            )}
            
            <div className="form-row">
                <div className="form-group half-width">
                    <label>Fuel Efficiency (mpg):</label>
                    <input
                    type="number"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    />
                </div>

                <div className="form-group half-width">
                    <label>Fuel Price (£ per liter):</label>
                    <input
                    type="number"
                    value={fuelPrice}
                    step="0.01"
                    onChange={(e) => setFuelPrice(e.target.value)}
                    />
                </div>
            </div>

            <p>Distance (km): {distance}</p>

            <label>Number of People Sharing Cost (including driver):</label>
            <input
                type="number"
                min="1"
                value={numPassengers}
                onChange={(e) => setNumPassengers(Number(e.target.value))}
            />
            
            <div className="inline-checkbox">
                <input
                type="checkbox"
                checked={excludeDriver}
                onChange={(e) => setExcludeDriver(e.target.checked)}
                id="excludeDriverToggle"
                />
                <span>Exclude driver from cost sharing</span>
            </div>


            <div className="buttons">
                <button
                    className="calculate"
                    onClick={calculateCost}
                    disabled={!fuelEfficiency || !fuelPrice}
                >
                    Calculate
                </button>

                <button className="back" onClick={() => navigate(`/route/${id}/update-route`)}>
                    Back to Route
                </button>
            </div>

            {estimatedCost && (
                <div className="cost-result">
                    <h4>Total Estimated Cost: £{estimatedCost}</h4>
                    <h4>Cost Per Person:</h4>
                    <ul>
                        {manualShares.map((share, index) => (
                            <li key={index}>
                                Passenger {index + 1}: £
                                <input
                                    type="number"
                                    step="0.01"
                                    value={share}
                                    onChange={(e) => handleManualShareChange(index, e.target.value)}
                                />
                            </li>
                        ))}
                    </ul>

                    {sharesEdited && (
                        <>
                            <p>New total: £{manualTotal.toFixed(2)}</p>
                            {estimatedCost &&
                                manualTotal.toFixed(2) !== parseFloat(estimatedCost).toFixed(2) && (
                                    <p>
                                        Warning: Total no longer matches estimated petrol cost (£{estimatedCost})
                                    </p>
                                )}
                            <button className="reset" onClick={resetShares}>
                                Reset to Equal Split
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default PetrolCalculator;
