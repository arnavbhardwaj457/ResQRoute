'use client';

import anime from 'animejs';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '../env';
import { DARK_TILE_ATTRIBUTION, DARK_TILE_URL } from '../lib/maps';
import { useRouteStore } from '../store/useRouteStore';
import { GlassCard } from './GlassCard';
import { GlowButton } from './GlowButton';

type LatLng = {
  lat: number;
  lng: number;
};

type AmbulanceLocationEvent = {
  ambulanceId: string;
  lat: number;
  lng: number;
  heading: number;
  timestamp: string;
};

function haversineDistanceKm(a: LatLng, b: LatLng) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2;
  const c =
    2 *
    Math.atan2(
      Math.sqrt(s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2),
      Math.sqrt(1 - (s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2)),
    );
  return R * c;
}

function formatEta(totalSeconds: number) {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createPointIcon(color: string, label: string) {
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;box-shadow:0 0 14px rgba(0,0,0,0.45)">${label}</div>`,
  });
}

function createAmbulanceIcon() {
  return L.divIcon({
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:26px;height:26px;border-radius:999px;border:2px solid rgba(255,255,255,0.85);background:rgba(249,115,22,0.95);display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 16px rgba(249,115,22,0.5)">🚑</div>`,
  });
}

export function TrackingExperience() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const mapInstanceRef = useRef<L.Map | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const { destination, emergencyLocation, origin, setDestination, clearEmergency } = useRouteStore();
  const emergencyOrigin = emergencyLocation ?? origin;

  const [ambulanceLocation, setAmbulanceLocation] = useState<LatLng | null>(null);
  const [distanceLeftKm, setDistanceLeftKm] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMapReady, setMapReady] = useState(false);

  const baselineDistance = useMemo(
    () => Math.max(0.1, haversineDistanceKm(emergencyOrigin, destination)),
    [destination, emergencyOrigin],
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [emergencyOrigin.lat, emergencyOrigin.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    originMarkerRef.current = L.marker([emergencyOrigin.lat, emergencyOrigin.lng], {
      icon: createPointIcon('#3b82f6', 'E'),
    }).addTo(map);

    destinationMarkerRef.current = L.marker([destination.lat, destination.lng], {
      icon: createPointIcon('#ef4444', 'D'),
    }).addTo(map);

    routeLineRef.current = L.polyline(
      [
        [emergencyOrigin.lat, emergencyOrigin.lng],
        [destination.lat, destination.lng],
      ],
      {
        color: '#60a5fa',
        opacity: 0.95,
        weight: 5,
        dashArray: '10 6',
      },
    ).addTo(map);

    map.fitBounds(routeLineRef.current.getBounds().pad(0.3));
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destination, emergencyOrigin]);

  useEffect(() => {
    if (!progressRef.current) return;

    anime({
      targets: progressRef.current,
      width: `${Math.max(0, Math.min(100, progress))}%`,
      easing: 'easeOutCubic',
      duration: 900,
    });
  }, [progress]);

  useEffect(() => {
    const socketEndpoint = env.NEXT_PUBLIC_SOCKET_URL ?? env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
    const socket = io(socketEndpoint, {
      transports: ['websocket'],
    });

    const animateAmbulance = (nextPosition: LatLng) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (!ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current = L.marker([nextPosition.lat, nextPosition.lng], {
          icon: createAmbulanceIcon(),
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        const marker = ambulanceMarkerRef.current;
        const start = marker.getLatLng();
        const tween = { lat: start.lat, lng: start.lng };

        anime.remove(tween);
        anime({
          targets: tween,
          lat: nextPosition.lat,
          lng: nextPosition.lng,
          easing: 'linear',
          duration: 1400,
          update: () => {
            marker.setLatLng([tween.lat, tween.lng]);
            routeLineRef.current?.setLatLngs([
              [tween.lat, tween.lng],
              [destination.lat, destination.lng],
            ]);
          },
        });
      }
    };

    socket.on('ambulance:location', (payload: AmbulanceLocationEvent) => {
      const nextPosition = { lat: payload.lat, lng: payload.lng };
      setAmbulanceLocation(nextPosition);
      animateAmbulance(nextPosition);
    });

    return () => {
      socket.disconnect();
    };
  }, [destination]);

  useEffect(() => {
    if (!ambulanceLocation) return;

    const left = haversineDistanceKm(ambulanceLocation, destination);
    const eta = (left / 45) * 3600;
    const done = 1 - left / baselineDistance;

    setDistanceLeftKm(Number(left.toFixed(2)));
    setEtaSeconds(Math.max(0, Math.round(eta)));
    setProgress(Math.max(0, Math.min(100, done * 100)));
  }, [ambulanceLocation, baselineDistance, destination]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleReroute = () => {
    const latShift = Number(((Math.random() - 0.5) * 0.02).toFixed(6));
    const lngShift = Number(((Math.random() - 0.5) * 0.02).toFixed(6));

    setDestination({
      lat: Number((destination.lat + latShift).toFixed(6)),
      lng: Number((destination.lng + lngShift).toFixed(6)),
    });
  };

  const handleCancelEmergency = () => {
    clearEmergency();
    router.push('/');
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <div className="relative min-h-[calc(100vh-146px)] overflow-hidden rounded-3xl border border-white/10">
        <div ref={mapRef} className="absolute inset-0 bg-slate-900/40" />

        {!isMapReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 text-sm text-slate-300">
            Loading tracking map...
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <GlassCard className="p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[1.1fr_1.1fr_2fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300">ETA Countdown</p>
                <p className="mt-1 text-3xl font-bold text-slate-100">{formatEta(etaSeconds)}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-300">Distance Left</p>
                <p className="mt-1 text-3xl font-bold text-slate-100">{distanceLeftKm.toFixed(2)} km</p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
                  <span>Route Progress</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700/70">
                  <div
                    ref={progressRef}
                    className="h-full w-0 rounded-full bg-gradient-to-r from-blue-400 via-sky-300 to-red-400"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <GlowButton type="button" onClick={handleReroute}>
                    Re-route
                  </GlowButton>
                  <button
                    type="button"
                    onClick={handleCancelEmergency}
                    className="rounded-xl border border-red-300/35 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
                  >
                    Cancel Emergency
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
