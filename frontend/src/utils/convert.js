export function kmToMiles(km) {
    return (km * 0.621371).toFixed(2); // returns string with 2 decimal places
}

export function metersToMiles(meters) {
    return (meters / 1000 * 0.621371).toFixed(2);
}