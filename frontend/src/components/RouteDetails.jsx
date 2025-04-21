// Displays route details for a given trip

function RouteDetails({ trip, distance, duration }) {
    if (!trip) return null; // Return nothing if trip is nnot available

    return (
        <div className="route-details">
            <h2>Road Trip to {trip.destination?.split(",")[0]}</h2>
            <p>From: {trip.start_location}</p>
            <p>To: {trip.destination}</p>
            <p>Distance: {distance} </p>
            <p>Duration: {duration} </p>
        </div>
    );
}

export default RouteDetails;
