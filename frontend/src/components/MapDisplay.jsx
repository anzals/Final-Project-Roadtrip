import { GoogleMap, DirectionsRenderer, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";


const LIBRARIES = ["places"];


function MapDisplay({ directions, suggestedPlaces = [], onAddPitstop, center = { lat: 51.509865, lng: -0.118092 }, zoom = 7, containerStyle }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const [selectedPlace, setSelectedPlace] = useState(null);

    if (!isLoaded) return <div>Loading map...</div>;

    return (
        <GoogleMap 
            mapContainerClassName="google-map-container"
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
                    <div style={{ maxWidth: '250px', fontFamily: 'Segoe UI, sans-serif' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: '600' }}>{selectedPlace.name}</h4>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#555' }}>{selectedPlace.vicinity}</p>

                        {selectedPlace.rating && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                                ⭐ {selectedPlace.rating} ({selectedPlace.user_ratings_total} reviews)
                            </div>
                        )}
                        <button onClick={() => {
                            onAddPitstop(`${selectedPlace.name} - ${selectedPlace.vicinity}`);
                            setSelectedPlace(null); // Close window
                            }}
                            style={{
                                backgroundColor: '#1e293b',
                                color: '#fff',
                                padding: '0.4rem 0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                marginTop: '0.75rem',
                              }}
                        >
                            Add Pitstop
                        </button>
                    </div>
                </InfoWindow>
            )}


        </GoogleMap>
    );
}

export default MapDisplay;
