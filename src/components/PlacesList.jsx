import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter, Landmark, Trees, Church, Telescope, Palette, History, Bookmark, BookmarkCheck } from 'lucide-react';

// Pick a nice icon based on category
const CategoryIcon = ({ category }) => {
  const cat = category?.toLowerCase() || '';
  const size = 32;
  const color = 'var(--color-accent)';
  if (cat.includes('temple') || cat.includes('mosque') || cat.includes('church') || cat.includes('religious')) return <Church size={size} color={color} />;
  if (cat.includes('nature') || cat.includes('park') || cat.includes('forest') || cat.includes('zoo')) return <Trees size={size} color={color} />;
  if (cat.includes('monument') || cat.includes('memorial') || cat.includes('ruin') || cat.includes('fort') || cat.includes('castle')) return <History size={size} color={color} />;
  if (cat.includes('museum') || cat.includes('gallery') || cat.includes('art')) return <Palette size={size} color={color} />;
  if (cat.includes('viewpoint')) return <Telescope size={size} color={color} />;
  return <Landmark size={size} color={color} />;
};

const PlacesList = ({ 
  places, 
  onFilteredPlaces, 
  savedPlacesIds = [], 
  onToggleSavePlace, 
  onSelectPlace,
  activeRoutePlaceId
}) => {
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(places.map((p) => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [places]);

  useEffect(() => {
    if (!places) return;
    const filtered = places.filter((place) => {
      const matchDistance = place.distance <= maxDistance;
      const matchCategory = selectedCategory === 'All' || place.category === selectedCategory;
      return matchDistance && matchCategory;
    });
    if (onFilteredPlaces) onFilteredPlaces(filtered);
  }, [places, maxDistance, selectedCategory, onFilteredPlaces]);

  if (!places || places.length === 0) return null;

  const filteredPlaces = places.filter((place) => {
    const matchDistance = place.distance <= maxDistance;
    const matchCategory = selectedCategory === 'All' || place.category === selectedCategory;
    return matchDistance && matchCategory;
  });

  return (
    <div className="glass-panel animate-fade-in w-full" style={{ marginTop: '2rem' }}>
      {/* Header + Filters */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin color="var(--color-accent)" />
          Famous Nearby Places
          <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
            ({filteredPlaces.length} found)
          </span>
        </h3>

        <div className="flex items-center gap-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '1rem', flexWrap: 'wrap' }}>
          <Filter size={18} color="var(--color-text-secondary)" />

          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Max Distance:</label>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.3rem 0.5rem', borderRadius: '0.5rem', outline: 'none' }}
            >
              <option value={2} style={{ color: 'black' }}>2 km</option>
              <option value={5} style={{ color: 'black' }}>5 km</option>
              <option value={10} style={{ color: 'black' }}>10 km</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.3rem 0.5rem', borderRadius: '0.5rem', outline: 'none' }}
            >
              {categories.map((cat) => (
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
          {filteredPlaces.map((place) => {
            const isSaved = savedPlacesIds.includes(place.id);
            const isRouted = activeRoutePlaceId === place.id;
            
            return (
              <div
                key={place.id}
                style={{
                  minWidth: '240px',
                  maxWidth: '240px',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  background: isRouted ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  border: isRouted ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectPlace && onSelectPlace(place)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Distance badge */}
                <div style={{
                  position: 'absolute', top: '10px', right: '10px', zIndex: 1,
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                  padding: '3px 8px', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold',
                }}>
                  {place.distance} km
                </div>

                {/* Save/Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid selecting/routing when clicking save
                    if (onToggleSavePlace) onToggleSavePlace(place);
                  }}
                  style={{
                    position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    border: 'none', padding: '0.4rem', borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSaved ? 'var(--color-accent)' : 'rgba(255,255,255,0.7)',
                    transition: 'transform 0.2s, color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={isSaved ? "Saved to Planner" : "Save to Planner"}
                >
                  {isSaved ? <BookmarkCheck size={16} color="var(--color-accent)" /> : <Bookmark size={16} />}
                </button>

                {/* Thumbnail or icon fallback */}
                <div style={{
                  height: '150px', overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {place.thumbnail ? (
                    <img
                      src={place.thumbnail}
                      alt={place.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentNode.querySelector('.icon-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="icon-fallback"
                    style={{
                      display: place.thumbnail ? 'none' : 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <CategoryIcon category={place.category} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>No Image</span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '0.85rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div className="flex justify-between items-center" style={{ width: '100%' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: '700', letterSpacing: '0.05em' }}>
                      {place.category.toUpperCase()}
                    </span>
                    {isRouted && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                        Active Route
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', lineHeight: 1.3 }}>
                    {place.title}
                  </h4>
                  {place.summary && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {place.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlacesList;
