const axios = require('axios');

async function testKey() {
  try {
    const res = await axios.get('https://api.foursquare.com/v3/places/search?ll=41.8781,-87.6298&limit=1', {
      headers: {
        Authorization: 'M1IDTE5C4FDBSCHRWNHXWQNRJ5RVCUBRZGZE0GOXVX5RZCGJ',
        Accept: 'application/json'
      }
    });
    console.log("SUCCESS");
  } catch (err) {
    console.log("ERROR: " + err.message);
  }
}
testKey();
