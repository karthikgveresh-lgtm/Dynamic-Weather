import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom icon for tourist places
const placeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom animated vehicle marker using a divIcon (emoji car)
const getCarIcon = (angle) => L.divIcon({
  html: `<div style="font-size: 26px; transform: rotate(${angle}deg); transform-origin: center; transition: transform 0.15s ease-out; display: inline-block;">🚗</div>`,
  className: 'car-marker-icon',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Helper to calculate angle between two coordinates
const getRotationAngle = (p1, p2) => {
  if (!p1 || !p2) return 0;
  const lat1 = p1[0], lon1 = p1[1];
  const lat2 = p2[0], lon2 = p2[1];
  const dy = lat2 - lat1;
  const dx = lon2 - lon1;
  // atan2 returns radians, convert to degrees
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);
  // Emojis usually face left. If car emoji faces left:
  // Traveling North (dy > 0, dx = 0) -> angle = 0. Car needs to face up. 
  // We offset by 270 degrees to align the left-facing emoji with direction of travel
  return angle - 90; 
};

const MapUpdater = ({ center, routeCoordinates, carPosition }) => {
  const map = useMap();
  useEffect(() => {
    if (carPosition) {
      map.panTo(carPosition, { animate: true, duration: 0.2 });
    } else if (routeCoordinates && routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates, { padding: [50, 50], animate: true });
    } else if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, routeCoordinates, carPosition, map]);
  return null;
};

const LiveMap = ({ 
  lat, 
  lon, 
  places = [], 
  routeCoordinates = [],
  isNavigating = false,
  onNavigationProgress,
  onNavigationComplete
}) => {
  const defaultCenter = [51.505, -0.09]; // London
  const center = lat && lon ? [lat, lon] : defaultCenter;

  const [stepIndex, setStepIndex] = useState(0);
  const [carPosition, setCarPosition] = useState(null);
  const [carAngle, setCarAngle] = useState(0);

  // Animation loop when simulation is active
  useEffect(() => {
    if (!isNavigating || routeCoordinates.length === 0) {
      setStepIndex(0);
      setCarPosition(null);
      return;
    }

    setCarPosition(routeCoordinates[0]);
    
    const interval = setInterval(() => {
      setStepIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= routeCoordinates.length) {
          clearInterval(interval);
          if (onNavigationComplete) onNavigationComplete();
          return prevIndex;
        }

        const currentPos = routeCoordinates[prevIndex];
        const nextPos = routeCoordinates[nextIndex];
        
        setCarPosition(nextPos);
        setCarAngle(getRotationAngle(currentPos, nextPos));

        // Report progress to parent
        if (onNavigationProgress) {
          onNavigationProgress(nextIndex / routeCoordinates.length);
        }

        return nextIndex;
      });
    }, 250); // move car every 250ms

    return () => clearInterval(interval);
  }, [isNavigating, routeCoordinates, onNavigationProgress, onNavigationComplete]);

  return (
    <div className="glass-panel" style={{ height: '100%', padding: '1rem', minHeight: '400px' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
        {/* Base Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater center={center} routeCoordinates={routeCoordinates} carPosition={carPosition} />
        
        {/* Main City Marker (Hide during active simulation to avoid crowding) */}
        {lat && lon && !isNavigating && (
          <Marker position={center}>
            <Popup>Current Location</Popup>
          </Marker>
        )}

        {/* Nearby Places Markers */}
        {places.map((place) => (
          place.lat && place.lon ? (
            <Marker key={place.id} position={[place.lat, place.lon]} icon={placeIcon}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  {place.thumbnail && (
                    <img src={place.thumbnail} alt={place.title} style={{ width: '100px', borderRadius: '4px', marginBottom: '4px' }} />
                  )}
                  <br />
                  <strong>{place.title}</strong>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>{place.distance} km away</span>
                  <br />
                  <a href={place.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>View Details</a>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Selected Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates} 
            color="var(--color-accent)" 
            weight={5} 
            opacity={0.85} 
          />
        )}

        {/* Simulated Car Marker */}
        {isNavigating && carPosition && (
          <Marker position={carPosition} icon={getCarIcon(carAngle)} />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
