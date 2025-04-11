import { GoogleMap, DirectionsRenderer, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";


const libraries = ["places"];
const defaultContainerStyle = {
    width: "100%",
    height: "500px",
};

function MapDisplay({ directions, suggestedPlaces = [], onAddPitstop, center = { lat: 51.509865, lng: -0.118092 }, zoom = 7, containerStyle }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [selectedPlace, setSelectedPlace] = useState(null);

    if (!isLoaded) return <div>Loading map...</div>;

    return (
        <GoogleMap 
            mapContainerStyle={containerStyle || defaultContainerStyle} 
            zoom={zoom} 
            center={center}
            options={{
                mapTypeControl: false,      // Disable map/satellite toggle
                streetViewControl: false,   // Disable street view pegman
                fullscreenControl: false,   // Disable fullscreen button
                zoomControl: false,         // Disable zoom buttons 
                scaleControl: false,        // Disable scale bar
                rotateControl: false,       // Disable map rotation control
            }}
        >
            {directions && <DirectionsRenderer directions={directions} />}
            {suggestedPlaces.map((place) => (
                <Marker
                key={place.place_id}
                position={place.geometry.location}
                onClick={() => setSelectedPlace(place)}
                />
            ))}
            {selectedPlace && (
                <InfoWindow
                position={selectedPlace.geometry.location}
                onCloseClick={() => setSelectedPlace(null)}
                >
                    <div>
                        <h4>{selectedPlace.name}</h4>
                        <p>{selectedPlace.vicinity}</p>
                        <button onClick={() => {
                            onAddPitstop(`${selectedPlace.name} - ${selectedPlace.vicinity}`);
                            setSelectedPlace(null); // Close window
                        }}>
                            Add Pitstop
                        </button>
                    </div>
                </InfoWindow>
            )}


        </GoogleMap>
    );
}

export default MapDisplay;
