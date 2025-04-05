import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

function AutocompleteInput({ id, placeholder, value, onChange }) {
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autoC) => {
        setAutocomplete(autoC);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
                onChange(place.formatted_address);
            }
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
                onChange={(e) => onChange(e.target.value)}
                required
            />
        </Autocomplete>
    );
}

export default AutocompleteInput;
