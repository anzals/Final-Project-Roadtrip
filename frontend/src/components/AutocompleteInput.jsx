import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

function AutocompleteInput({ id, placeholder, value, onChange, setPlaceDetails }) {
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
    
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
                    onChange(e.target.value);
                    if (setPlaceDetails) setPlaceDetails(null); // Clear place if user types manually
                }}
                required
            />
        </Autocomplete>
    );
}

export default AutocompleteInput;
