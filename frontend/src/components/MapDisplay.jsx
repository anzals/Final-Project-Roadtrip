import { GoogleMap, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];
const defaultContainerStyle = {
    width: "100%",
    height: "500px",
};

function MapDisplay({ directions, center = { lat: 51.509865, lng: -0.118092 }, zoom = 7, containerStyle }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    if (!isLoaded) return <div>Loading map...</div>;

    return (
        <GoogleMap 
            mapContainerStyle={containerStyle || defaultContainerStyle} 
            zoom={zoom} 
            center={center}
        >
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
}

export default MapDisplay;
