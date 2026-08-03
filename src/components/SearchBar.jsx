import React, { useState } from 'react';
import { Search, Navigation } from 'lucide-react';

const SearchBar = ({ onSearch, onLocationSearch }) => {
  const [city, setCity] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity('');
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (onLocationSearch) {
            await onLocationSearch(latitude, longitude);
          }
          setGeoLoading(false);
        },
        (error) => {
          console.error(error);
          alert("Error getting location. Please ensure location permissions are enabled.");
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="flex gap-3 w-full">
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Search for a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit" className="primary-btn">
          <Search size={18} />
          <span>Search</span>
        </button>
        <button
          type="button"
          onClick={handleUseLocation}
          className="glass-panel flex items-center justify-center"
          style={{
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            background: geoLoading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            transition: 'background 0.2s',
          }}
          disabled={geoLoading}
          title="Use my current location"
        >
          <Navigation size={18} className={geoLoading ? "animate-pulse" : ""} color="var(--color-accent)" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
