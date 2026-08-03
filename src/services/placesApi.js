import axios from 'axios';

const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';

// Haversine formula to calculate exact distance in KM between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
};

// Extremely basic text-based categorization based on Wikipedia summaries
const guessCategory = (title, summary) => {
  const text = (title + ' ' + summary).toLowerCase();
  if (text.match(/temple|church|mosque|shrine|cathedral|religious/)) return 'Religious';
  if (text.match(/museum|gallery|art|history|historical|monument|fort|palace/)) return 'Historical';
  if (text.match(/park|garden|lake|river|mountain|nature|forest|waterfall/)) return 'Nature';
  if (text.match(/stadium|arena|sports/)) return 'Sports';
  if (text.match(/school|university|college|institute/)) return 'Education';
  return 'Tourist Place';
};

/**
 * Fetch famous nearby places using Wikipedia API
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Array} Array of place objects
 */
export const fetchNearbyPlaces = async (lat, lon) => {
  try {
    // 1. Search for places near the coordinates (radius 10km, max limit 50)
    const geoResponse = await axios.get(WIKI_API_URL, {
      params: {
        action: 'query',
        list: 'geosearch',
        gscoord: `${lat}|${lon}`,
        gsradius: 10000,
        gslimit: 50,
        format: 'json',
        origin: '*', // Required for CORS
      }
    });

    const geosearch = geoResponse.data?.query?.geosearch;
    
    if (!geosearch || geosearch.length === 0) {
      return [];
    }

    const pageIds = geosearch.map(place => place.pageid);

    // 2. Fetch images, coordinates, and text summaries for these pages
    // We fetch in chunks of 50
    const detailsResponse = await axios.get(WIKI_API_URL, {
      params: {
        action: 'query',
        pageids: pageIds.join('|'),
        prop: 'pageimages|coordinates|extracts',
        pithumbsize: 400,
        exintro: 1,
        explaintext: 1,
        format: 'json',
        origin: '*',
      }
    });

    const pages = detailsResponse.data?.query?.pages;
    
    if (!pages) {
      return [];
    }

    // 3. Format the data, prioritizing places that have thumbnail images
    const places = Object.values(pages)
      .filter(page => page.thumbnail) // Only keep places with images for a beautiful UI
      .map(page => {
        const placeLat = page.coordinates ? page.coordinates[0].lat : null;
        const placeLon = page.coordinates ? page.coordinates[0].lon : null;
        let distance = null;
        
        if (placeLat && placeLon) {
          distance = calculateDistance(lat, lon, placeLat, placeLon);
        }

        const summary = page.extract || '';
        const category = guessCategory(page.title, summary);

        return {
          id: page.pageid,
          title: page.title,
          lat: placeLat,
          lon: placeLon,
          distance: distance ? parseFloat(distance.toFixed(1)) : 0, // distance in km rounded to 1 decimal
          category: category,
          thumbnail: page.thumbnail.source,
          summary: summary.substring(0, 100) + '...', // short snippet
          url: `https://en.wikipedia.org/?curid=${page.pageid}`
        };
      })
      .sort((a, b) => a.distance - b.distance); // Sort by closest first

    return places;
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return [];
  }
};
