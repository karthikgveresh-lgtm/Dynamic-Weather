import axios from 'axios';

const FSQ_API_URL = 'https://api.foursquare.com/v3/places/search';
const API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;

/**
 * Fetch famous nearby places using Foursquare API
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Array} Array of place objects
 */
export const fetchNearbyPlaces = async (lat, lon) => {
  if (!API_KEY || API_KEY === 'your_copied_key_here') {
    console.error("Foursquare API key is missing.");
    return [];
  }

  try {
    // 1. Search for popular places near the coordinates (radius 10km, limit 50)
    // Categories: 16000 (Landmarks & Outdoors), 10000 (Arts & Entertainment), 13000 (Dining)
    const response = await axios.get(FSQ_API_URL, {
      params: {
        ll: `${lat},${lon}`,
        radius: 10000,
        limit: 50,
        sort: 'POPULARITY',
        fields: 'fsq_id,name,geocodes,categories,distance,photos,rating',
      },
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
      }
    });

    const results = response.data?.results;
    
    if (!results || results.length === 0) {
      return [];
    }

    // 2. Format the data, prioritizing places that have photos
    const places = results
      .filter(place => place.photos && place.photos.length > 0) // Only keep places with images
      .map(place => {
        const placeLat = place.geocodes?.main?.latitude;
        const placeLon = place.geocodes?.main?.longitude;
        
        // Foursquare returns distance in meters, convert to KM
        const distanceKm = place.distance ? (place.distance / 1000).toFixed(1) : 0;
        
        // Get primary category name
        const categoryName = place.categories && place.categories.length > 0 
            ? place.categories[0].name 
            : 'Tourist Place';
            
        // Construct photo URL (prefix + size + suffix)
        const photo = place.photos[0];
        const thumbnailUrl = `${photo.prefix}400x400${photo.suffix}`;

        return {
          id: place.fsq_id,
          title: place.name,
          lat: placeLat,
          lon: placeLon,
          distance: parseFloat(distanceKm),
          category: categoryName,
          thumbnail: thumbnailUrl,
          summary: `Rating: ${place.rating ? place.rating + ' / 10' : 'Unrated'}`, // Use rating as summary
          url: `https://foursquare.com/v/${place.fsq_id}`
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by closest first

    return places;
  } catch (error) {
    console.error("Error fetching nearby places from Foursquare:", error);
    return [];
  }
};
