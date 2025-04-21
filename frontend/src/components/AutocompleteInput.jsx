// Code inspired by:
// Title: "How to use Google Maps API with React including Directions and Places Autocomplete"
// Author: Mafia Codes
// YouTube: https://www.youtube.com/watch?v=iP3DnhCUIsE

import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

// Google Maps Autocomplete input field used to select a location in the UK.
function AutocompleteInput({ id, placeholder, value, onChange, setPlaceDetails }) {
    const [autocomplete, setAutocomplete] = useState(null);

    // Runs when the autocomplete component has been initialised
    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    // Runs when the user selects a place from suggestions
    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace(); // gets place details
    
            if (!place.geometry) {
                console.error("No details available for input: ", place);
                if (setPlaceDetails) setPlaceDetails(null);
                return;
            }

            const address = place.formatted_address || place.name;
            onChange(address);
            if (setPlaceDetails) setPlaceDetails(place); 
        }
    };

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                componentRestrictions: { country: "gb" },
            }}
        >
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value); // Updates text as use user types
                    if (setPlaceDetails) setPlaceDetails(null); // Clear place if user types manually
                }}
                required
            />
        </Autocomplete>
    );
}

export default AutocompleteInput;
