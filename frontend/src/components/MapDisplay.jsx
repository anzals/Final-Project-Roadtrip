// Code inspired by:
// Title: "How to use Google Maps API with React including Directions and Places Autocomplete"
// Author: Mafia Codes
// YouTube: https://www.youtube.com/watch?v=iP3DnhCUIsE

import { GoogleMap, DirectionsRenderer, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import api from "../api";


const LIBRARIES = ["places"]; // Libraries required by the Google Maps API

// Returns specific colour marker icons based on the cateory of the place.
function getIconColor(category) {
    switch (category) {
        case "restaurant":
            return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        case "lodging":
            return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
        case "restroom":
            return "http://maps.google.com/mapfiles/ms/icons/purple-dot.png";
        case "gas_station":
            return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
        case "charging_station":
        case "electric_vehicle_charging_station":
            return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
        default:
            return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    }
}


function MapDisplay({ directions, suggestedPlaces = [], onAddPitstop, categoryFilters = [], zoom = 7, containerStyle }) {

    // Loads google maps script
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const [selectedPlace, setSelectedPlace] = useState(null);

    const mapCenter = directions?.routes[0]?.bounds?.getCenter?.() || { lat: 53.5, lng: -2 }; // Centers map bsed on route or fallbacks to the middle of the UK


    if (!isLoaded) return <div>Loading map...</div>;

    return (
        <GoogleMap 
            mapContainerClassName="google-map-container"
            zoom={zoom} 
            center={mapCenter}
            options={{
                mapTypeControl: false,      // Disable map/satellite toggle
                streetViewControl: false,   // Disable street view pegman
                fullscreenControl: false,   // Disable fullscreen button
                zoomControl: false,         // Disable zoom buttons 
                scaleControl: false,        // Disable scale bar
                rotateControl: false,       // Disable map rotation control
                minZoom: 6,
                restriction: {
                    latLngBounds: {
                        north: 61.2,   
                        south: 49.5,   
                        west: -11.0,   
                        east: 2.2,     
                    },
                    strictBounds: false  
                }
            }}
        >
            {/* Renders the route on the map */}
            {directions && <DirectionsRenderer directions={directions} />}
            {/* Renders the markers for suggested pitstops on the map */}
            {suggestedPlaces.map((place) => (
                <Marker
                key={place.place_id + place._category}
                position={place.geometry.location}
                onClick={() => setSelectedPlace(place)}
                icon={{
                    url: getIconColor(place._category),
                    scaledSize: new window.google.maps.Size(40, 40),
                }}
                />
            ))}

            {/* Shows an InfoWindow when a place is selected */}
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
                            onAddPitstop(selectedPlace);
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
