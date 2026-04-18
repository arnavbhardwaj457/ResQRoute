'use client';

import { Loader } from '@googlemaps/js-api-loader';
import anime from 'animejs';
import { io } from 'socket.io-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '../env';
import { fetchHospitalsWithCache, HospitalDto } from '../lib/hospitals';
import { useRouteStore } from '../store/useRouteStore';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

type LatLng = {
  lat: number;
  lng: number;
};

type Hospital = HospitalDto;

type RouteMetrics = {
  distanceText: string;
  durationText: string;
};

type AmbulanceLocationEvent = {
  ambulanceId: string;
  lat: number;
  lng: number;
  heading: number;
  timestamp: string;
};

type PositionLike = {
  lat: () => number;
  lng: () => number;
};

type MarkerLike = {
  setPosition: (position: LatLng) => void;
  getPosition?: () => PositionLike | undefined;
  setIcon?: (icon: Record<string, unknown>) => void;
};

type GoogleMapsLike = {
  maps: {
    Marker: new (options: Record<string, unknown>) => MarkerLike;
    SymbolPath: {
      FORWARD_CLOSED_ARROW: unknown;
    };
  };
};

function haversineDistanceKm(a: LatLng, b: LatLng) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2), Math.sqrt(1 - (s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2)));
  return R * c;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function estimateDurationText(distanceKm: number) {
  // Use a calm default city speed estimate for fallback ETA.
  const minutes = Math.max(1, Math.round((distanceKm / 35) * 60));
  return `~${minutes} min`;
}

export function DashboardMapExperience() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const mapsApiRef = useRef<GoogleMapsLike | null>(null);
  const ambulanceMarkerRef = useRef<MarkerLike | null>(null);
  const pulseAnimationsRef = useRef<anime.AnimeInstance[]>([]);
  const hospitalsFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { emergencyLocation, emergencyTriggeredAt, origin } = useRouteStore();

  const userLocation = emergencyLocation ?? origin;
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [isMapLoading, setMapLoading] = useState(true);
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    if (hospitalsFetchTimerRef.current) {
      clearTimeout(hospitalsFetchTimerRef.current);
    }

    hospitalsFetchTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const response = await fetchHospitalsWithCache(env.NEXT_PUBLIC_API_URL, userLocation);
          setHospitals(response.hospitals);
        } catch {
          setHospitals([]);
        }
      })();
    }, 350);

    return () => {
      if (hospitalsFetchTimerRef.current) {
        clearTimeout(hospitalsFetchTimerRef.current);
      }
    };
  }, [userLocation]);

  const nearestHospital = useMemo<Hospital>(() => {
    if (hospitals.length === 0) {
      return {
        _id: 'fallback',
        name: 'Fallback Hospital',
        location: userLocation,
        address: 'N/A',
      };
    }

    return hospitals.reduce((nearest, hospital) => {
      const nearestDistance = haversineDistanceKm(userLocation, nearest.location);
      const currentDistance = haversineDistanceKm(userLocation, hospital.location);
      return currentDistance < nearestDistance ? hospital : nearest;
    }, hospitals[0] as Hospital);
  }, [hospitals, userLocation]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMapAndRoute() {
      if (!mapRef.current) return;

      setMapLoading(true);
      setRouteError(null);
      setRouteMetrics(null);

      try {
        const loader = new Loader({ apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, version: 'weekly' });
        const google = await loader.load();
        if (!isMounted || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1220' }] },
          ],
        });

        mapInstanceRef.current = map;
        mapsApiRef.current = google as unknown as GoogleMapsLike;

        const userMarker = new google.maps.Marker({
          map,
          position: userLocation,
          title: 'User',
          label: { text: 'U', color: '#ffffff' },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 9,
          },
        });

        const hospitalMarkers = hospitals.map((hospital) => {
          const marker = new google.maps.Marker({
            map,
            position: hospital.location,
            title: hospital.name,
            label: { text: 'H', color: '#ffffff' },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ef4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            },
          });
          return marker;
        });

        const userPulse = { scale: 9 };
        pulseAnimationsRef.current.push(
          anime({
            targets: userPulse,
            scale: [9, 11, 9],
            easing: 'easeInOutSine',
            duration: 1500,
            loop: true,
            update: () => {
              userMarker.setIcon?.({
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: userPulse.scale,
              });
            },
          }),
        );

        hospitalMarkers.forEach((marker, index) => {
          const pulse = { scale: 8 };
          pulseAnimationsRef.current.push(
            anime({
              targets: pulse,
              scale: [8, 9.4, 8],
              easing: 'easeInOutSine',
              duration: 1700 + index * 110,
              loop: true,
              update: () => {
                marker.setIcon?.({
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#ef4444',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: pulse.scale,
                });
              },
            }),
          );
        });

        const animatedRouteLine = new google.maps.Polyline({
          map,
          path: [userLocation, userLocation],
          geodesic: true,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });

        const drawProgress = { t: 0 };
        anime({
          targets: drawProgress,
          t: 1,
          easing: 'easeOutCubic',
          duration: 1200,
          update: () => {
            animatedRouteLine.setPath([
              userLocation,
              {
                lat: lerp(userLocation.lat, nearestHospital.location.lat, drawProgress.t),
                lng: lerp(userLocation.lng, nearestHospital.location.lng, drawProgress.t),
              },
            ]);
          },
        });

        const fallbackDistanceKm = haversineDistanceKm(userLocation, nearestHospital.location);
        new google.maps.Polyline({
          map,
          path: [userLocation, nearestHospital.location],
          geodesic: true,
          strokeColor: '#60a5fa',
          strokeOpacity: 0.95,
          strokeWeight: 5,
        });
        setRouteMetrics({
          distanceText: `${fallbackDistanceKm.toFixed(1)} km`,
          durationText: estimateDurationText(fallbackDistanceKm),
        });
        setMapLoading(false);
      } catch {
        setRouteError('Unable to initialize Google Map. Check API key and Maps APIs.');
        setMapLoading(false);
      }
    }

    initializeMapAndRoute();

    return () => {
      isMounted = false;
      pulseAnimationsRef.current.forEach((animation) => animation.pause());
      pulseAnimationsRef.current = [];
    };
  }, [hospitals, nearestHospital, userLocation]);

  useEffect(() => {
    const socket = io(env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket'],
    });

    const animateAmbulanceMarker = (nextPosition: LatLng) => {
      const marker = ambulanceMarkerRef.current;
      const map = mapInstanceRef.current;
      const google = mapsApiRef.current;

      if (!map || !google) {
        return;
      }

      if (!marker) {
        ambulanceMarkerRef.current = new google.maps.Marker({
          map,
          position: nextPosition,
          title: 'Ambulance AMB-01',
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            rotation: 0,
            scale: 6,
          },
          zIndex: 20,
        });
        return;
      }

      const currentPosition = marker.getPosition?.();
      const start = currentPosition
        ? { lat: currentPosition.lat(), lng: currentPosition.lng() }
        : nextPosition;

      const tween = { lat: start.lat, lng: start.lng };
      const iconPulse = { scale: 6 };

      anime.remove(tween);
      anime({
        targets: tween,
        lat: nextPosition.lat,
        lng: nextPosition.lng,
        easing: 'linear',
        duration: 1800,
        update: () => {
          marker.setPosition({ lat: tween.lat, lng: tween.lng });
        },
      });

      anime({
        targets: iconPulse,
        scale: [6, 7.2, 6],
        duration: 900,
        easing: 'easeOutSine',
        update: () => {
          marker.setIcon?.({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            rotation: 0,
            scale: iconPulse.scale,
          });
        },
      });
    };

    socket.on('ambulance:location', (payload: AmbulanceLocationEvent) => {
      const nextPosition = { lat: payload.lat, lng: payload.lng };
      setAmbulanceLocation(nextPosition);
      animateAmbulanceMarker(nextPosition);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const trackerItems = [
    { label: 'Emergency Received', status: emergencyTriggeredAt ? 'done' : 'pending' },
    { label: 'Location Locked', status: userLocation ? 'done' : 'pending' },
    { label: 'Nearest Hospital Identified', status: nearestHospital ? 'done' : 'pending' },
    { label: 'Route Prepared', status: routeMetrics ? 'done' : 'pending' },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <div className="relative min-h-[calc(100vh-146px)] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30">
        <div ref={mapRef} className="absolute inset-0" />

        {isMapLoading ? (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]">
            <div className="absolute left-6 top-6 h-4 w-48 animate-pulse rounded bg-slate-200/20" />
            <div className="absolute left-6 top-14 h-4 w-64 animate-pulse rounded bg-slate-200/15" />
            <div className="absolute left-6 top-24 h-4 w-56 animate-pulse rounded bg-slate-200/10" />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 top-0 ml-auto w-full max-w-md p-3 md:p-4">
          <div className="flex h-full flex-col gap-3">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Emergency Info</p>
                <StatusBadge label={emergencyTriggeredAt ? 'Active' : 'Standby'} variant={emergencyTriggeredAt ? 'error' : 'ok'} />
              </div>
              {isMapLoading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-slate-200/20" />
                  <div className="h-3 w-56 animate-pulse rounded bg-slate-200/15" />
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-200">
                  <p>User: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
                  <p className="mt-1 text-slate-300">
                    Ambulance:{' '}
                    {ambulanceLocation
                      ? `${ambulanceLocation.lat.toFixed(6)}, ${ambulanceLocation.lng.toFixed(6)}`
                      : 'Awaiting live feed...'}
                  </p>
                  <p className="mt-1 text-slate-300">
                    Triggered: {emergencyTriggeredAt ? new Date(emergencyTriggeredAt).toLocaleTimeString() : 'Not triggered'}
                  </p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-red-300">Nearest Hospital</p>
                <StatusBadge label="Matched" variant="info" />
              </div>
              {isMapLoading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-52 animate-pulse rounded bg-slate-200/20" />
                  <div className="h-3 w-36 animate-pulse rounded bg-slate-200/15" />
                  <div className="h-3 w-44 animate-pulse rounded bg-slate-200/10" />
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-200">
                  <p className="font-medium text-slate-100">{nearestHospital.name}</p>
                  <p className="mt-1">Distance: {routeMetrics?.distanceText ?? 'Calculating...'}</p>
                  <p className="mt-1">ETA: {routeMetrics?.durationText ?? 'Calculating...'}</p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Status Tracker</p>
                <StatusBadge label={routeMetrics ? 'In Progress' : 'Initializing'} variant={routeMetrics ? 'ok' : 'warning'} />
              </div>
              <ul className="mt-3 space-y-2">
                {trackerItems.map((item) => (
                  <li key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                    <span className="text-sm text-slate-200">{item.label}</span>
                    <StatusBadge label={item.status === 'done' ? 'Done' : 'Pending'} variant={item.status === 'done' ? 'ok' : 'warning'} />
                  </li>
                ))}
              </ul>
              {routeError ? <p className="mt-3 text-xs text-amber-300">{routeError}</p> : null}
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
