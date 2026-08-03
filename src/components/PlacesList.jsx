import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter } from 'lucide-react';

const PlacesList = ({ places, onFilteredPlaces }) => {
  const [maxDistance, setMaxDistance] = useState(10); // Default max distance: 10km
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = useMemo(() => {
    const cats = new Set(places.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [places]);

  // Apply filters whenever places or filter settings change
  useEffect(() => {
    if (!places) return;
    
    const filtered = places.filter(place => {
      const matchDistance = place.distance <= maxDistance;
      const matchCategory = selectedCategory === 'All' || place.category === selectedCategory;
      return matchDistance && matchCategory;
    });
    
    // Notify parent component so map can update its markers
    if (onFilteredPlaces) {
      onFilteredPlaces(filtered);
    }
  }, [places, maxDistance, selectedCategory, onFilteredPlaces]);

  if (!places || places.length === 0) return null;

  // The local filtered list for display
  const filteredPlaces = places.filter(place => {
    const matchDistance = place.distance <= maxDistance;
    const matchCategory = selectedCategory === 'All' || place.category === selectedCategory;
    return matchDistance && matchCategory;
  });

  return (
    <div className="glass-panel animate-fade-in w-full" style={{ marginTop: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin color="var(--color-accent)" /> Famous Nearby Places
        </h3>
        
        {/* Filters UI */}
        <div className="flex items-center gap-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
          <Filter size={18} color="var(--color-text-secondary)" />
          
          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Max Distance:</label>
            <select 
              value={maxDistance} 
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '0.5rem', outline: 'none' }}
            >
              <option value={2} style={{ color: 'black' }}>2 km</option>
              <option value={5} style={{ color: 'black' }}>5 km</option>
              <option value={10} style={{ color: 'black' }}>10 km</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '0.5rem', outline: 'none' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredPlaces.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No places found matching your filters. Try increasing the distance or changing the category.
        </div>
      ) : (
        <div className="flex gap-6" style={{ overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
          {filteredPlaces.map((place) => (
            <a 
              href={place.url} 
              target="_blank" 
              rel="noopener noreferrer"
              key={place.id}
              style={{ 
                minWidth: '240px', 
                maxWidth: '240px',
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {place.distance} km
              </div>
              <div style={{ height: '140px', overflow: 'hidden' }}>
                <img 
                  src={place.thumbnail} 
                  alt={place.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginBottom: '0.2rem', fontWeight: '600' }}>
                  {place.category.toUpperCase()}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{place.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{place.summary}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesList;
