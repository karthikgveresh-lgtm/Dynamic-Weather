import axios from 'axios';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';

// Haversine formula to calculate exact distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Map OpenStreetMap tourism/historic tags to user-friendly category names
const getCategory = (tags) => {
  const tourism = tags?.tourism;
  const historic = tags?.historic;
  const amenity = tags?.amenity;
  const religion = tags?.religion;

  if (amenity === 'place_of_worship') {
    if (religion === 'hindu') return 'Hindu Temple';
    if (religion === 'muslim') return 'Mosque';
    if (religion === 'christian') return 'Church';
    return 'Religious';
  }
  if (tourism === 'museum') return 'Museum';
  if (tourism === 'artwork') return 'Artwork';
  if (tourism === 'viewpoint') return 'Viewpoint';
  if (tourism === 'zoo') return 'Zoo';
  if (tourism === 'theme_park') return 'Theme Park';
  if (tourism === 'attraction') return 'Tourist Attraction';
  if (tourism === 'gallery') return 'Art Gallery';
  if (historic === 'monument') return 'Monument';
  if (historic === 'memorial') return 'Memorial';
  if (historic === 'ruins') return 'Historic Ruins';
  if (historic === 'castle' || historic === 'fort') return 'Fort / Castle';
  if (historic === 'temple') return 'Temple';
  if (historic === 'shrine') return 'Shrine';
  if (historic === 'archaeological_site') return 'Archaeological Site';
  return 'Landmark';
};

/**
 * Fetch tourist places via Overpass API (OpenStreetMap)
 * Then enrich with Wikipedia images
 */
export const fetchNearbyPlaces = async (lat, lon) => {
  try {
    // Step 1: Query Overpass for actual tourist/historic tagged places
    const radius = 10000; // 10km
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"~"^(attraction|museum|artwork|viewpoint|gallery|zoo|theme_park)$"](around:${radius},${lat},${lon});
        node["historic"~"^(monument|memorial|ruins|castle|fort|temple|shrine|archaeological_site)$"](around:${radius},${lat},${lon});
        node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
        way["tourism"~"^(attraction|museum|viewpoint|gallery|zoo)$"](around:${radius},${lat},${lon});
        way["historic"~"^(monument|memorial|ruins|castle|fort|temple|shrine|archaeological_site)$"](around:${radius},${lat},${lon});
        way["amenity"="place_of_worship"](around:${radius},${lat},${lon});
        relation["tourism"="attraction"](around:${radius},${lat},${lon});
      );
      out center 60;
    `;

    const overpassResponse = await axios.post(
      OVERPASS_URL,
      `data=${encodeURIComponent(query)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const elements = overpassResponse.data?.elements;
    if (!elements || elements.length === 0) return [];

    // Step 2: Extract named places only and deduplicate
    const seenNames = new Set();
    const rawPlaces = elements
      .filter((el) => {
        const name = el.tags?.name;
        if (!name || seenNames.has(name)) return false;
        seenNames.add(name);
        return true;
      })
      .map((el) => {
        const placeLat = el.lat ?? el.center?.lat;
        const placeLon = el.lon ?? el.center?.lon;
        return {
          id: el.id,
          title: el.tags.name,
          lat: placeLat,
          lon: placeLon,
          distance: placeLat && placeLon ? calculateDistance(lat, lon, placeLat, placeLon) : 0,
          category: getCategory(el.tags),
          thumbnail: null,
          summary: el.tags['description'] || el.tags['wikipedia'] || '',
          url: el.tags.wikipedia
            ? `https://en.wikipedia.org/wiki/${el.tags.wikipedia.replace(/^..?:/, '')}`
            : `https://www.openstreetmap.org/${el.type}/${el.id}`,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // top 50 closest

    // Step 3: Batch Wikipedia image lookup for the top 30 places
    const topPlaces = rawPlaces.slice(0, 30);
    const names = topPlaces.map((p) => p.title);

    if (names.length > 0) {
      try {
        const wikiResponse = await axios.get(WIKI_API_URL, {
          params: {
            action: 'query',
            titles: names.join('|'),
            prop: 'pageimages|extracts',
            pithumbsize: 500,
            exintro: 1,
            explaintext: 1,
            redirects: 1,
            format: 'json',
            origin: '*',
          },
        });

        const pages = wikiResponse.data?.query?.pages || {};
        // Build a map: normalized title → thumbnail + summary
        const wikiMap = {};
        const normalizations = wikiResponse.data?.query?.normalized || [];
        const normMap = {};
        normalizations.forEach((n) => { normMap[n.to] = n.from; });

        Object.values(pages).forEach((page) => {
          if (page.title) {
            const thumb = page.thumbnail?.source || null;
            const extract = page.extract ? page.extract.substring(0, 100) + '...' : '';
            wikiMap[page.title.toLowerCase()] = { thumb, extract };
            // Also map the original (un-normalized) name
            const origName = normMap[page.title];
            if (origName) wikiMap[origName.toLowerCase()] = { thumb, extract };
          }
        });

        topPlaces.forEach((place) => {
          const wikiData = wikiMap[place.title.toLowerCase()];
          if (wikiData) {
            place.thumbnail = wikiData.thumb;
            if (wikiData.extract) place.summary = wikiData.extract;
          }
        });
      } catch (wikiErr) {
        console.warn('Wikipedia enrichment failed:', wikiErr.message);
      }
    }

    return topPlaces;
  } catch (error) {
    console.error('Error fetching nearby places:', error.message);
    return [];
  }
};
