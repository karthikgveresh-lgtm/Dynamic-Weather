const axios = require('axios');

async function testHassanTemples() {
  const lat = 13.0033;
  const lon = 76.1004;
  const radius = 10000;
  
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"^(attraction|museum)$"](around:${radius},${lat},${lon});
      node["historic"~"^(monument|ruins|castle|fort|temple|shrine)$"](around:${radius},${lat},${lon});
      node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
    );
    out center 30;
  `;
  
  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const elements = res.data.elements || [];
    console.log(`Found ${elements.length} elements.`);
    elements.forEach(el => {
      if (el.tags) {
        console.log(`- ${el.tags.name}:`, Object.keys(el.tags).filter(k => k !== 'name'));
        if (el.tags.image || el.tags.wikipedia || el.tags.wikimedia_commons) {
          console.log(`  -> image: ${el.tags.image}, wiki: ${el.tags.wikipedia}, commons: ${el.tags.wikimedia_commons}`);
        }
      }
    });
  } catch (err) {
    console.log("Error:", err.message);
  }
}
testHassanTemples();
