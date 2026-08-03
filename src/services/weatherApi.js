import axios from 'axios';

const GEO_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch weather data by city name using Open-Meteo (No API key required)
 */
export const fetchWeatherData = async (city) => {
  try {
    // 1. Geocode the city using Nominatim for better coverage
    const geoResponse = await axios.get(GEO_URL, {
      params: {
        q: city,
        format: 'json',
        limit: 1,
      },
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error("City not found");
    }

    const location = geoResponse.data[0];
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);
    
    // Extract the main name (often before the first comma)
    const name = location.display_name.split(',')[0];
    const country = ''; // Nominatim doesn't return country nicely in this format unless we use addressdetails=1, but name is enough

    // 2. Fetch weather and forecast
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        hourly: 'temperature_2m,relative_humidity_2m',
        timezone: 'auto',
      },
    });

    return {
      location: { name, country, lat: latitude, lon: longitude },
      current: weatherResponse.data.current,
      daily: weatherResponse.data.daily,
      hourly: weatherResponse.data.hourly,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch weather data");
  }
};

/**
 * WMO Weather interpretation codes (WW)
 * Mapping to standard descriptions and our dynamic backgrounds
 */
export const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

// Lucide icon mapping based on weather code
export const getWeatherIconName = (code, isDay = 1) => {
  if (code === 0) return isDay ? 'Sun' : 'Moon';
  if (code >= 1 && code <= 3) return 'Cloud';
  if (code === 45 || code === 48) return 'CloudFog';
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return 'CloudRain';
  if (code >= 71 && code <= 77) return 'CloudSnow';
  if (code >= 95 && code <= 99) return 'CloudLightning';
  return 'Cloud';
};
