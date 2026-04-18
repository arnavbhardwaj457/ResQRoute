'use client';

import dynamic from 'next/dynamic';
import type { LatLng } from '@resqroute/types';
import type { MockHospital } from '@/lib/mockData';
import { MapSkeleton } from '@/components/ui/Skeleton';

/* ─────────────────────────────────────────────
   MapView — Dynamic import of LeafletMap
   (Leaflet requires window/document, so we
    disable SSR via next/dynamic)
   ───────────────────────────────────────────── */

const LeafletMap = dynamic(
  () => import('./LeafletMap').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

interface RouteInfo {
  distance: string;
  duration: string;
  durationValue: number;
  steps: string[];
  source: 'osrm' | 'fallback';
}

interface MapViewProps {
  userLocation: LatLng;
  hospitals: MockHospital[];
  nearestHospitalId: string | null;
  onRouteCalculated?: (info: RouteInfo) => void;
  onHospitalSelected?: (hospitalId: string) => void;
  className?: string;
}

export function MapView({
  userLocation,
  hospitals,
  nearestHospitalId,
  onRouteCalculated,
  onHospitalSelected,
  className = '',
}: MapViewProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <LeafletMap
        userLocation={userLocation}
        hospitals={hospitals}
        nearestHospitalId={nearestHospitalId}
        onRouteCalculated={onRouteCalculated}
        onHospitalSelected={onHospitalSelected}
        className="h-full w-full"
      />
    </div>
  );
}

export default MapView;
