import React, { useEffect } from 'react';
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

const MapUpdater = ({ center, routeCoordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      map.fitBounds(routeCoordinates, { padding: [50, 50], animate: true });
    } else if (center) {
      map.setView(center, 12, { animate: true }); // Zoom in a bit more to see places
    }
  }, [center, routeCoordinates, map]);
  return null;
};

const LiveMap = ({ lat, lon, places = [], routeCoordinates = [] }) => {
  const defaultCenter = [51.505, -0.09]; // London
  const center = lat && lon ? [lat, lon] : defaultCenter;

  return (
    <div className="glass-panel" style={{ height: '100%', padding: '1rem', minHeight: '400px' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
        {/* Base Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater center={center} routeCoordinates={routeCoordinates} />
        
        {/* Main City Marker */}
        {lat && lon && (
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
      </MapContainer>
    </div>
  );
};

export default LiveMap;
