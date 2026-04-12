import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            // Reverse geocode using Nominatim
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    { headers: { 'User-Agent': 'CivicEngagementApp/1.0' } }
                );
                const data = await res.json();
                onLocationSelect({
                    lat,
                    lon: lng,
                    address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                });
            } catch {
                onLocationSelect({
                    lat,
                    lon: lng,
                    address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                });
            }
        }
    });
    return null;
};

const LocationPickerMap = ({ onLocationSelect, selectedPosition }) => {
    return (
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: '300px' }}>
            <MapContainer
                center={[7.8731, 80.7718]} // Sri Lanka default
                zoom={7}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                />
                <ClickHandler onLocationSelect={onLocationSelect} />
                {selectedPosition && (
                    <Marker position={[selectedPosition.lat, selectedPosition.lon]} />
                )}
            </MapContainer>
        </div>
    );
};

export default LocationPickerMap;