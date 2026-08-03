const axios = require('axios');

async function testOverpass() {
  const lat = 51.505;
  const lon = -0.09;
  const radius = 5000; // 5km
  
  const query = `
    [out:json];
    (
      node["tourism"](around:${radius},${lat},${lon});
      node["historic"](around:${radius},${lat},${lon});
    );
    out center 20;
  `;
  
  try {
    const res = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log("OVERPASS SUCCESS:", res.data.elements.length, "places found.");
    console.log(res.data.elements[0]);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}
testOverpass();
