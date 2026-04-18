'use client';

import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import { env } from '../env';
import { useRouteStore } from '../store/useRouteStore';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

export function MapCard() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { origin, destination } = useRouteStore();

  useEffect(() => {
    let mounted = true;

    async function initializeMap() {
      try {
        const loader = new Loader({ apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, version: 'weekly' });
        const google = await loader.load();
        if (!mapRef.current || !mounted) return;

        const map = new google.maps.Map(mapRef.current, {
          center: origin,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });

        new google.maps.Marker({ map, position: origin, title: 'Origin' });
        new google.maps.Marker({ map, position: destination, title: 'Destination' });
      } catch {
        setError('Unable to load Google Maps. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      }
    }

    initializeMap();

    return () => {
      mounted = false;
    };
  }, [origin, destination]);

  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Route Map</h2>
        <StatusBadge label="Live" variant="info" />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div ref={mapRef} className="h-[420px] w-full rounded-2xl" />
    </GlassCard>
  );
}
