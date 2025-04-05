function RouteDetails({ trip, distance, duration }) {
    if (!trip) return null;

    return (
        <div className="route-details">
            <h2>Route for: {trip.title}</h2>
            <p>From: {trip.startLocation}</p>
            <p>To: {trip.destination}</p>
            <p>Distance: {distance}</p>
            <p>Duration: {duration}</p>
        </div>
    );
}

export default RouteDetails;
