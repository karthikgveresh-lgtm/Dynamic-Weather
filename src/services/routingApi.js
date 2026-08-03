import axios from 'axios';

const TOMTOM_ROUTE_URL = 'https://api.tomtom.com/routing/1/calculateRoute';
const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

/**
 * Fetch travel route between two points using TomTom Routing API
 * @param {number} startLat Source Latitude
 * @param {number} startLon Source Longitude
 * @param {number} endLat Target Latitude
 * @param {number} endLon Target Longitude
 * @returns {Object|null} Object containing route coordinates, distance (km), and duration (mins)
 */
export const calculateRoute = async (startLat, startLon, endLat, endLon) => {
  if (!API_KEY) {
    console.error("TomTom API key is missing.");
    return null;
  }

  try {
    const response = await axios.get(`${TOMTOM_ROUTE_URL}/${startLat},${startLon}:${endLat},${endLon}/json`, {
      params: {
        key: API_KEY,
        travelMode: 'car'
      }
    });

    const route = response.data?.routes?.[0];
    if (!route) return null;

    const summary = route.summary;
    const points = route.legs?.[0]?.points || [];

    // Map points [{latitude, longitude}, ...] to Leaflet format [[lat, lon], ...]
    const polyline = points.map(pt => [pt.latitude, pt.longitude]);

    return {
      polyline,
      distanceKm: (summary.lengthInMeters / 1000).toFixed(1),
      durationMins: Math.round(summary.travelTimeInSeconds / 60)
    };
  } catch (error) {
    console.error("Error calculating route from TomTom:", error);
    return null;
  }
};
