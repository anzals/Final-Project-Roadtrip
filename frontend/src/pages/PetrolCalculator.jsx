import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { kmToMiles, metersToMiles } from "../utils/convert";
import api from "../api";
import fuelData from '../data/fuelData.json';
import Layout from "../components/Layout";
import '../styles/PetrolCalculator.css';

function PetrolCalculator() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    const [fuelEfficiency, setFuelEfficiency] = useState('');
    const [fuelPrice, setFuelPrice] = useState('');
    const [distance, setDistance] = useState(0); 
    const [estimatedCost, setEstimatedCost] = useState(null);

    const [excludeDriver, setExcludeDriver] = useState(false);
    const [manualShares, setManualShares] = useState([]);
    const [sharesEdited, setSharesEdited] = useState(false);

    const [selectedMake, setSelectedMake] = useState('');
    const [selectedFuelType, setSelectedFuelType] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [manualEntry, setManualEntry] = useState(false);

    const [numPassengers, setNumPassengers] = useState(1);
    const [selectedDriverEmail, setSelectedDriverEmail] = useState("");
    const [message, setMessage] = useState(null);

    const people = trip ? [trip.author, ...(trip.collaborators || [])] : [];

    // Load trip data
    useEffect(() => {
        api.get(`/api/trips/${id}/`)
            .then((res) => {
                const tripData = res.data;
                setTrip(tripData);
                setDistance(parseFloat(location.state?.distance || tripData.route?.distance || 0));
                setNumPassengers(1 + (tripData.collaborators?.length || 0));
                setSelectedDriverEmail(tripData.author?.email || '');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load trip:', err);
                setLoading(false);
            });
    }, [id]);

    // Normalise fuel type names
    const normaliseFuelType = (type) => {
        const lower = type.toLowerCase();
        if (lower.includes('electric') && lower.includes('petrol')) return 'Hybrid';
        if (lower.includes('electricity') && lower.includes('petrol')) return 'Hybrid';
        if (lower.includes('electric')) return 'Electric';
        if (lower.includes('diesel')) return 'Diesel';
        if (lower.includes('petrol')) return 'Petrol';
        return type;
    };

    // Filter cars with valid MPG and normalise fuel types
    const validCars = fuelData.filter(car => car["WLTP Imperial Combined"] > 0).map(car => ({
        ...car,
        normalizedFuel: normaliseFuelType(car["Fuel Type"])
    }));

    // Dropdwon options
    const makes = [...new Set(validCars.map(car => car.Manufacturer))];
    const fuelTypes = [...new Set(validCars.filter(car => car.Manufacturer === selectedMake).map(car => car.normalizedFuel))];
    const models = validCars.filter(car => car.Manufacturer === selectedMake && car.normalizedFuel === selectedFuelType);

    // Estimate petrol cost from inputs
    const calculateCost = () => {
        if (!fuelEfficiency || fuelEfficiency <= 0 || !fuelPrice || fuelPrice <= 0) {
            setMessage({ type: "error", text: "Please fill in all fields before calculating." });
            return;
        }

        // Equation for working out fuel price for trip
        const distanceInMiles = distance;
        const gallons = distanceInMiles / fuelEfficiency; 
        const litres = gallons * 4.54609; 
        const totalCost = litres * fuelPrice;

        setEstimatedCost(totalCost.toFixed(2));
        autoDivideCost(totalCost);
    };

    // Automatically divide cost between passangers, option to exlude driver
    const autoDivideCost = (total) => {
        if (numPassengers <= 0) return;

        const baseShare = total / (excludeDriver ? numPassengers - 1 : numPassengers);
        const newShares = people.slice(0, numPassengers).map((person) => {
            if (excludeDriver && person?.email === selectedDriverEmail) return "0.00";
            return baseShare.toFixed(2);
        });

        while (newShares.length < numPassengers) {
            newShares.push(baseShare.toFixed(2));
        }

        setManualShares(newShares);
    };

    // Track manual cost edits
    const handleManualShareChange = (index, value) => {
        const updated = [...manualShares];
        updated[index] = value;
        setManualShares(updated);
        setSharesEdited(true);
    };

    const manualTotal = manualShares.reduce((sum, val) => sum + parseFloat(val || 0), 0);

    // Reset shares to default split
    const resetShares = () => {
        if (numPassengers <= 0) return;

        const baseShare = estimatedCost / (excludeDriver ? numPassengers - 1 : numPassengers);
        const newShares = people.slice(0, numPassengers).map((person) => {
            if (excludeDriver && person?.email === selectedDriverEmail) return "0.00";
            return baseShare.toFixed(2);
        });

        while (newShares.length < numPassengers) {
            newShares.push(baseShare.toFixed(2));
        }

        setManualShares(newShares);
        setSharesEdited(false);
    };

    // Save estimated petrol data to backend
    const savePetrolData = () => {
        const data = {
            petrol_cost: parseFloat(estimatedCost),
            passenger_shares: manualShares.map((share, i) => ({
                name: people[i]?.first_name + " " + people[i]?.last_name,
                email: people[i]?.email,
                share: parseFloat(share),
            })),
        };

        api.patch(`/api/routes/${id}/update/`, data)
        .then(() => {
            setMessage({ type: "success", text: "Petrol cost and shares saved!" });
        })
        .catch((err) => {
            console.error("Error saving petrol data:", err);
            setMessage({ type: "error", text: "Failed to save petrol data." });
        });
    };

    // Clear error message after 3 seconds
    useEffect(() => {
        if (message?.type === "error") {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);    

    return (
        <Layout>
            <div className="petrol-calculator-page">
            <h2 className="trip-title">Estimate Petrol Cost</h2>
            <div className="main-container">
                <div className="form-section">
                    {message && <div className={`form-message ${message.type}`}>{message.text}</div>}
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

                    <p>Distance (mi): {distance.toFixed(2)}</p>

                    <label>Number of People Sharing Cost (including driver):</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={numPassengers}
                        onChange={(e) => {
                            const value = Math.min(5, Math.max(1, Number(e.target.value))); // between 1 and 5
                            setNumPassengers(value);
                          }}
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

                    {excludeDriver && (
                        <div className="driver-select-row">
                            <label>Who is the driver?</label>
                            <select
                            value={selectedDriverEmail}
                            onChange={(e) => setSelectedDriverEmail(e.target.value)}
                            disabled={!people.length}
                            >
                                {people.map((person, index) => (
                                    <option key={index} value={person.email}>
                                        {person.first_name} {person.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}


                    <div className="buttons">
                        <button
                        className="calculate"
                        onClick={calculateCost}
                        >
                            Calculate
                        </button>


                        <button className="back" onClick={() => navigate(`/route/${id}/update-route`)}>
                            Back to Route
                        </button>
                    </div>
                </div>
                {estimatedCost && (
                    <div className="results-section">
                        <h4>Total Estimated Cost: £{estimatedCost}</h4>
                        <h4>Cost Per Person:</h4>
                        <ul>
                            {Array.from({ length: numPassengers }).map((_, index) => {
                                const person = people[index];
                                const isDriver = excludeDriver && person?.email === selectedDriverEmail;
                                const share = manualShares[index] ?? '';
                            
                                return (
                                <li key={index}>
                                    {person ? (
                                        <>
                                            <strong>{person.first_name} {person.last_name}</strong> (£)
                                            {isDriver && <span className="driver-label"> (Driver - not paying)</span>}
                                            <br />
                                        </>
                                        ) : (
                                        <>
                                            <strong>Passenger {index + 1}</strong>: £
                                        </>
                                    )}
                                
                                    <input
                                    type="number"
                                    step="0.01"
                                    value={share}
                                    onChange={(e) => handleManualShareChange(index, e.target.value)}
                                    disabled={isDriver}
                                    />
                                </li>
                                );
                            })}
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
                        
                        <button className="save" onClick={savePetrolData}>
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
        </Layout>
    );
}

export default PetrolCalculator;
