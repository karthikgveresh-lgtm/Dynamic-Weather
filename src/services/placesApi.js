import axios from 'axios';

const TOMTOM_API_URL = 'https://api.tomtom.com/search/2/nearbySearch/.json';
const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';
const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

// Unsplash category fallback images (premium, high-quality, category-relevant stock photos)
const CATEGORY_IMAGES = {
  'Temple & Religious': [
    'https://images.unsplash.com/photo-1608958416715-e24c538cb331?auto=format&fit=crop&w=500&q=80', // Temple
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=500&q=80', // Taj
    'https://images.unsplash.com/photo-1609137144813-7d84877395b5?auto=format&fit=crop&w=500&q=80'  // Lotus Temple
  ],
  'Historical & Cultural': [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80', // Fort
    'https://images.unsplash.com/photo-1600100397608-f010e42ec9bc?auto=format&fit=crop&w=500&q=80', // Palace
    'https://images.unsplash.com/photo-1596422846543-75c6fc18a52b?auto=format&fit=crop&w=500&q=80'  // Ruins
  ],
  'Nature & Parks': [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80', // Garden
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&q=80', // Forest/Trees
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=80'  // Waterfall/Woods
  ],
  'Tourist Attraction': [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=500&q=80', // India landmark
    'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=500&q=80', // Landscape
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=500&q=80'  // Gateway of India
  ]
};

// Return a random image for the category
const getFallbackImage = (category) => {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Tourist Attraction'];
  return images[Math.floor(Math.random() * images.length)];
};

// Map TomTom categories to simplified local categories
const mapCategory = (poi) => {
  const categories = poi.categories || [];
  const joined = categories.join(' ').toLowerCase();

  if (joined.includes('temple') || joined.includes('church') || joined.includes('mosque') || joined.includes('worship') || joined.includes('synagogue') || joined.includes('shrine')) {
    return 'Temple & Religious';
  }
  if (joined.includes('museum') || joined.includes('gallery') || joined.includes('monument') || joined.includes('castle') || joined.includes('fort') || joined.includes('historic') || joined.includes('ruins')) {
    return 'Historical & Cultural';
  }
  if (joined.includes('park') || joined.includes('garden') || joined.includes('lake') || joined.includes('river') || joined.includes('forest') || joined.includes('nature') || joined.includes('waterfall') || joined.includes('zoo')) {
    return 'Nature & Parks';
  }
  return 'Tourist Attraction';
};

/**
 * Fetch tourist places using TomTom Places API & enrich with Wikipedia photos
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Array} Array of formatted place objects
 */
export const fetchNearbyPlaces = async (lat, lon) => {
  if (!API_KEY) {
    console.error("TomTom API key is missing.");
    return [];
  }

  try {
    // 1. Fetch nearby POIs from TomTom Search
    // Category Sets: 7376 (Tourist Attraction), 7374 (Museum), 9362 (Park/Recreation Area), 7332 (Place of Worship)
    const response = await axios.get(TOMTOM_API_URL, {
      params: {
        key: API_KEY,
        lat,
        lon,
        radius: 10000, // 10km
        limit: 50,
        categorySet: '7376,7374,9362,7332'
      }
    });

    const results = response.data?.results;
    if (!results || results.length === 0) {
      return [];
    }

    // 2. Map TomTom data to our standard structure and assign Unsplash placeholder images first
    const places = results.map(place => {
      const name = place.poi.name;
      const category = mapCategory(place.poi);
      const distanceKm = place.dist ? (place.dist / 1000).toFixed(1) : 0;

      return {
        id: place.id,
        title: name,
        lat: place.position.lat,
        lon: place.position.lon,
        distance: parseFloat(distanceKm),
        category,
        thumbnail: getFallbackImage(category), // Start with a premium category image
        summary: place.address.freeformAddress || 'Attraction',
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${place.position.lat},${place.position.lon}`
      };
    });

    // 3. Batch Lookup in Wikipedia to replace placeholders with real images where available
    const titles = places.slice(0, 30).map(p => p.title);
    if (titles.length > 0) {
      try {
        const wikiResponse = await axios.get(WIKI_API_URL, {
          params: {
            action: 'query',
            titles: titles.join('|'),
            prop: 'pageimages|extracts',
            pithumbsize: 600,
            exintro: 1,
            explaintext: 1,
            redirects: 1,
            format: 'json',
            origin: '*'
          }
        });

        const pages = wikiResponse.data?.query?.pages || {};
        const wikiMap = {};
        
        // Map redirects if any
        const normalizations = wikiResponse.data?.query?.normalized || [];
        const normMap = {};
        normalizations.forEach(n => { normMap[n.to] = n.from; });

        Object.values(pages).forEach(page => {
          if (page.title) {
            const thumb = page.thumbnail?.source;
            const extract = page.extract ? page.extract.substring(0, 120) + '...' : null;
            
            if (thumb || extract) {
              wikiMap[page.title.toLowerCase()] = { thumb, extract };
              const origName = normMap[page.title];
              if (origName) {
                wikiMap[origName.toLowerCase()] = { thumb, extract };
              }
            }
          }
        });

        // Apply Wikipedia photos & summaries to our places list
        places.forEach(place => {
          const match = wikiMap[place.title.toLowerCase()];
          if (match) {
            if (match.thumb) {
              place.thumbnail = match.thumb; // Override placeholder with real photo!
            }
            if (match.extract) {
              place.summary = match.extract; // Override generic address with real description!
            }
          }
        });
      } catch (wikiErr) {
        console.warn("Wikipedia lookup failed, using fallbacks:", wikiErr.message);
      }
    }

    return places;
  } catch (error) {
    console.error("Error fetching nearby places from TomTom:", error);
    return [];
  }
};
