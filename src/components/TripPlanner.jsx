import React from 'react';
import { Calendar, Trash2, MapPin } from 'lucide-react';

const TripPlanner = ({ savedPlaces, onRemovePlace, onSelectPlace }) => {
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--color-accent)" /> My Trip Planner
        </h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
          {savedPlaces.length} Saved
        </span>
      </div>

      {savedPlaces.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No places saved to your itinerary yet. Click the bookmark icon on any attraction card to add it here!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {savedPlaces.map((place) => (
            <div 
              key={place.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                gap: '0.75rem',
                transition: 'background 0.2s',
              }}
              className="flex justify-between"
            >
              <div 
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
                onClick={() => onSelectPlace && onSelectPlace(place)}
              >
                {place.thumbnail ? (
                  <img 
                    src={place.thumbnail} 
                    alt={place.title} 
                    style={{ width: '45px', height: '45px', borderRadius: '0.5rem', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '45px', 
                    height: '45px', 
                    borderRadius: '0.5rem', 
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={18} color="var(--color-text-secondary)" />
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', maxWidth: '160px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {place.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 500 }}>
                    {place.distance} km away
                  </span>
                </div>
              </div>

              <button 
                onClick={() => onRemovePlace(place.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  padding: '0.4rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.background = 'none';
                }}
                title="Remove from itinerary"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
