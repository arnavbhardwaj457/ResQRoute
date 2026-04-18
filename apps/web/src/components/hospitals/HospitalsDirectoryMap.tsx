'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MockHospital } from '@/lib/mockData';
import { DARK_TILE_ATTRIBUTION, DARK_TILE_URL } from '@/lib/maps';

const hospitalIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: '<div style="width:28px;height:28px;border-radius:999px;border:2px solid rgba(0,240,255,0.65);background:rgba(0,240,255,0.15);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(0,240,255,0.24)">🏥</div>',
});

interface HospitalsDirectoryMapProps {
  hospitals: MockHospital[];
  center: { lat: number; lng: number };
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export function HospitalsDirectoryMap({ hospitals, center }: HospitalsDirectoryMapProps) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-cyber-cyan/15">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer attribution={DARK_TILE_ATTRIBUTION} url={DARK_TILE_URL} />
        <RecenterMap center={center} />
        {hospitals.map((hospital) => (
          <Marker key={hospital.id} position={[hospital.location.lat, hospital.location.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-sm font-semibold">{hospital.name}</p>
                <p className="text-xs text-gray-500">{hospital.address}</p>
                <p className="text-xs text-gray-500">{hospital.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default HospitalsDirectoryMap;
