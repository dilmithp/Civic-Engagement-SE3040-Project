import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons breaking in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to programmatically update the map's center when position changes
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat !== 0 && position.lng !== 0) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
};

const LocationPickerMap = ({ position, onLocationSelect }) => {
  // Default to Sri Lanka center if no position
  const defaultCenter = [7.8731, 80.7718]; 
  const isPosValid = position && position.lat !== 0 && position.lng !== 0;
  const center = isPosValid ? [position.lat, position.lng] : defaultCenter;
  const zoom = isPosValid ? 14 : 7;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border z-0 relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isPosValid && <Marker position={[position.lat, position.lng]} />}
        <MapEvents onLocationSelect={onLocationSelect} />
        <MapUpdater position={position} />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
