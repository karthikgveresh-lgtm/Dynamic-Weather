const axios = require('axios');

async function testKey() {
  try {
    const res = await axios.get('https://api.foursquare.com/v3/places/search?ll=41.8781,-87.6298&limit=1', {
      headers: {
        Authorization: 'fsq3BTXQaGWUcqRzKYQOY1aEZ84OI9qty6wyfqeoGpYWuq4=',
        Accept: 'application/json'
      }
    });
    console.log("SUCCESS");
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
}
testKey();
