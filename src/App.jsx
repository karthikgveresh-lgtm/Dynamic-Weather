import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import LiveMap from './components/LiveMap';
import PlacesList from './components/PlacesList';
import { fetchWeatherData, getWeatherDescription } from './services/weatherApi';
import { fetchNearbyPlaces } from './services/placesApi';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [placesData, setPlacesData] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic background based on weather condition
  useEffect(() => {
    if (!weatherData) {
      document.body.style.background = 'var(--color-bg-primary)';
      return;
    }
    
    const code = weatherData.current.weather_code;
    const condition = getWeatherDescription(code).toLowerCase();
    
    // Smooth transition between backgrounds
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      document.body.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
    } else if (condition.includes('cloud') || condition.includes('fog')) {
      document.body.style.background = 'linear-gradient(135deg, #475569, #1e293b)';
    } else if (condition.includes('clear')) {
      document.body.style.background = 'linear-gradient(135deg, #0284c7, #0ea5e9)';
    } else if (condition.includes('snow')) {
      document.body.style.background = 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
    } else {
      document.body.style.background = 'var(--color-bg-primary)';
    }
  }, [weatherData]);

  const handleSearch = async (city) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      
      // Fetch nearby places concurrently (or right after)
      const places = await fetchNearbyPlaces(data.location.lat, data.location.lon);
      setPlacesData(places);
      setFilteredPlaces(places); // initially filtered places are all places
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setPlacesData([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="flex flex-col items-center justify-center gap-6" style={{ marginTop: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-accent)' }}>Dynamic</span>Weather
        </h1>
        <SearchBar onSearch={handleSearch} />
        {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>{error}</div>}
      </header>

      {loading ? (
        <div className="flex justify-center items-center" style={{ flexGrow: 1 }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6" style={{ flexGrow: 1 }}>
          <div className="dashboard-grid">
            <div style={{ height: '100%', minHeight: '400px' }}>
              <WeatherDisplay weather={weatherData} />
            </div>
            
            <div style={{ height: '100%', minHeight: '400px' }}>
              {weatherData ? (
                <LiveMap lat={weatherData.location.lat} lon={weatherData.location.lon} places={filteredPlaces} />
              ) : (
                <LiveMap lat={null} lon={null} />
              )}
            </div>
          </div>
          
          <PlacesList places={placesData} onFilteredPlaces={setFilteredPlaces} />
        </div>
      )}
    </div>
  );
}

export default App;
