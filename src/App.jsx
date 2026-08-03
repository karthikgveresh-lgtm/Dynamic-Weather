import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import LiveMap from './components/LiveMap';
import PlacesList from './components/PlacesList';
import TravelIndex from './components/TravelIndex';
import TripPlanner from './components/TripPlanner';
import { fetchWeatherData, getWeatherDescription } from './services/weatherApi';
import { fetchNearbyPlaces } from './services/placesApi';
import { calculateRoute } from './services/routingApi';
import { Eye, EyeOff, Play, Square } from 'lucide-react';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [placesData, setPlacesData] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const saved = localStorage.getItem('savedPlaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeRoute, setActiveRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync saved places with LocalStorage
  useEffect(() => {
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  // Live GPS Tracking Effect
  useEffect(() => {
    let watchId = null;
    if (isTracking) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            handleLocationSearch(latitude, longitude);
          },
          (error) => {
            console.error("GPS Tracking Error:", error);
            setError("Failed to obtain live location updates.");
            setIsTracking(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
        setIsTracking(false);
      }
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);
  
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
    setActiveRoute(null); // Clear routing on new search
    setIsNavigating(false);
    
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      
      // Fetch nearby places using TomTom API
      const places = await fetchNearbyPlaces(data.location.lat, data.location.lon);
      setPlacesData(places);
      setFilteredPlaces(places);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
      setPlacesData([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (lat, lon) => {
    setError('');
    try {
      const key = import.meta.env.VITE_TOMTOM_API_KEY;
      const res = await axios.get(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${key}`);
      const city = res.data?.addresses?.[0]?.address?.municipality || 
                   res.data?.addresses?.[0]?.address?.freeformAddress || 
                   'Hassan';
      
      // Call standard weather fetch
      const data = await fetchWeatherData(city);
      setWeatherData(data);

      const places = await fetchNearbyPlaces(lat, lon);
      setPlacesData(places);
      setFilteredPlaces(places);
    } catch (err) {
      setError('Failed to detect city name from your location.');
    }
  };

  const handleToggleSavePlace = (place) => {
    setSavedPlaces(prev => {
      const exists = prev.some(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  const handleRemoveSavedPlace = (id) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
  };

  const handleSelectPlace = async (place) => {
    if (!weatherData) return;
    
    // Toggle route off if clicking the same place twice
    if (activeRoute && activeRoute.placeId === place.id) {
      setActiveRoute(null);
      setIsNavigating(false);
      return;
    }

    setIsNavigating(false); // Reset navigation simulation
    const startLat = weatherData.location.lat;
    const startLon = weatherData.location.lon;
    
    const route = await calculateRoute(startLat, startLon, place.lat, place.lon);
    if (route) {
      setActiveRoute({
        ...route,
        originalDistance: parseFloat(route.distanceKm),
        originalDuration: parseInt(route.durationMins),
        placeId: place.id
      });
    }
  };

  // Compute dynamic navigation stats
  const remainingDistance = activeRoute
    ? (activeRoute.originalDistance * (1 - navProgress)).toFixed(1)
    : 0;

  const remainingDuration = activeRoute
    ? Math.round(activeRoute.originalDuration * (1 - navProgress))
    : 0;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <header className="flex flex-col items-center justify-center gap-6" style={{ marginTop: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span style={{ color: 'var(--color-accent)' }}>Dynamic</span>Weather
        </h1>
        
        {/* Search controls & Geotracking settings */}
        <div className="flex gap-4 items-center justify-center w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <SearchBar onSearch={handleSearch} onLocationSearch={handleLocationSearch} />
          
          <button
            type="button"
            onClick={() => setIsTracking(prev => !prev)}
            className="glass-panel flex items-center justify-center gap-2"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: isTracking ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              background: isTracking ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            title={isTracking ? "Disable live tracking" : "Enable live tracking"}
          >
            {isTracking ? <Eye size={18} color="#10b981" className="animate-pulse" /> : <EyeOff size={18} />}
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{isTracking ? 'Tracking' : 'Track Me'}</span>
          </button>
        </div>
        
        {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>{error}</div>}
      </header>

      {loading ? (
        <div className="flex justify-center items-center" style={{ flexGrow: 1, minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        weatherData && (
          <div className="flex flex-col gap-6" style={{ flexGrow: 1 }}>
            {/* Main Premium Dashboard Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'start'
            }}>
              {/* Column 1: Weather Details & Charts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <WeatherDisplay weather={weatherData} />
              </div>

              {/* Column 2: Live Map & Selected Route summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                  <LiveMap 
                    lat={weatherData.location.lat} 
                    lon={weatherData.location.lon} 
                    places={filteredPlaces} 
                    routeCoordinates={activeRoute?.polyline || []}
                    isNavigating={isNavigating}
                    onNavigationProgress={setNavProgress}
                    onNavigationComplete={() => {
                      setIsNavigating(false);
                      setNavProgress(0);
                    }}
                  />
                </div>
                
                {activeRoute && (
                  <div className="glass-panel animate-fade-in flex flex-col gap-3" style={{ padding: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>
                          {isNavigating ? 'Simulating Route...' : 'Directions Calculated'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {isNavigating ? 'Driving to destination' : 'Click start to preview the journey'}
                        </p>
                      </div>
                      
                      {/* Simulation Triggers */}
                      <button
                        onClick={() => {
                          if (isNavigating) {
                            setIsNavigating(false);
                            setNavProgress(0);
                          } else {
                            setIsNavigating(true);
                          }
                        }}
                        className="flex items-center gap-2"
                        style={{
                          background: isNavigating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          border: isNavigating ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                          color: isNavigating ? '#ef4444' : '#10b981',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      >
                        {isNavigating ? <Square size={14} /> : <Play size={14} />}
                        <span>{isNavigating ? 'Stop' : 'Start'}</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Remaining Distance</div>
                          <div style={{ fontWeight: '600', color: 'var(--color-accent)' }}>{remainingDistance} km</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Est. Duration</div>
                          <div style={{ fontWeight: '600', color: 'var(--color-accent)' }}>{remainingDuration} mins</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <TravelIndex weather={weatherData} />
              </div>
            </div>

            {/* Places Grid and Trip Planner panel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '3fr 1fr',
              gap: '2rem',
              alignItems: 'start',
              marginTop: '1rem'
            }}
            className="planner-grid"
            >
              <div>
                <PlacesList 
                  places={placesData} 
                  onFilteredPlaces={setFilteredPlaces} 
                  savedPlacesIds={savedPlaces.map(p => p.id)}
                  onToggleSavePlace={handleToggleSavePlace}
                  onSelectPlace={handleSelectPlace}
                  activeRoutePlaceId={activeRoute?.placeId}
                />
              </div>
              <div>
                <TripPlanner 
                  savedPlaces={savedPlaces} 
                  onRemovePlace={handleRemoveSavedPlace}
                  onSelectPlace={handleSelectPlace}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;
