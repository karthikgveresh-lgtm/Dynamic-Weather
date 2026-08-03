const axios = require('axios');

async function testKey() {
  try {
    const res = await axios.get('https://api.foursquare.com/v3/places/search?ll=41.8781,-87.6298&limit=1', {
      headers: {
        Authorization: 'OGHO0PMU5ZWW3GMUEALP5GKJFSOGNTG2GCJ4EORBIJMCR1NC',
        Accept: 'application/json'
      }
    });
    console.log("SUCCESS");
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
}
testKey();
