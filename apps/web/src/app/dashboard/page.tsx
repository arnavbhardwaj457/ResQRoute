'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store';
import { MapView, EmergencyInfoCard, NearestHospitalCard, StatusTracker } from '@/components/dashboard';
import { getMockHospitals, findNearestHospital, haversineDistance } from '@/lib/mockData';
import { getFastestHospitalRoute } from '@/lib/maps';
import type { LatLng } from '@resqroute/types';

/* ─────────────────────────────────────────────
   Dashboard Page — Full-screen map + HUD panels
   ───────────────────────────────────────────── */

interface RouteInfo {
  distance: string;
  duration: string;
  durationValue: number;
  steps: string[];
  source: 'osrm' | 'fallback';
}

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
      setDate(
        now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right">
      <p className="font-mono text-xs font-bold text-cyber-cyan">{time}</p>
      <p className="text-[10px] text-gray-500">{date} IST</p>
    </div>
  );
}

function ElapsedTimer({ startTime }: { startTime: string | null }) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const tick = () => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime) return null;
  return (
    <span className="font-mono text-sm font-bold text-accent-red-400 animate-glow-pulse">
      {elapsed}
    </span>
  );
}

export default function DashboardPage() {
  const emergency = useAppStore((s) => s.emergency);

  // Default location if no emergency (Delhi, India)
  const userLocation: LatLng = useMemo(
    () => emergency.location ?? { lat: 28.6139, lng: 77.2090 },
    [emergency.location],
  );

  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Generate hospitals around user
  const hospitals = useMemo(() => getMockHospitals(userLocation), [userLocation]);

  // Find nearest
  const nearestResult = useMemo(() => findNearestHospital(userLocation, hospitals), [userLocation, hospitals]);
  const selectedHospital = useMemo(
    () => hospitals.find((h) => h.id === selectedHospitalId) ?? nearestResult?.hospital ?? null,
    [hospitals, selectedHospitalId, nearestResult?.hospital],
  );
  const selectedDistanceKm = useMemo(
    () => (selectedHospital ? haversineDistance(userLocation, selectedHospital.location) : null),
    [selectedHospital, userLocation],
  );

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const computeFastest = async () => {
      const fastest = await getFastestHospitalRoute(userLocation, hospitals);
      if (!active) return;
      if (fastest?.hospitalId) {
        setSelectedHospitalId(fastest.hospitalId);
      } else {
        setSelectedHospitalId(nearestResult?.hospital.id ?? null);
      }
    };

    void computeFastest();

    return () => {
      active = false;
    };
  }, [userLocation, hospitals, nearestResult?.hospital.id]);

  const handleRouteCalculated = useCallback((info: RouteInfo) => {
    setRouteInfo(info);
  }, []);

  const handleHospitalSelected = useCallback((hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setRouteInfo(null);
  }, []);

  return (
    <main className="relative h-[calc(100vh-60px)] overflow-hidden bg-surface">
      {/* ── Full-screen Map ──────────────────── */}
      <div className="absolute inset-0">
        {!loading && (
          <MapView
            userLocation={userLocation}
            hospitals={hospitals}
            nearestHospitalId={selectedHospitalId ?? nearestResult?.hospital.id ?? null}
            onRouteCalculated={handleRouteCalculated}
            onHospitalSelected={handleHospitalSelected}
            className="h-full w-full"
          />
        )}

        {/* Map loading skeleton */}
        {loading && (
          <div className="h-full w-full bg-surface flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/20">
                <svg className="h-8 w-8 text-cyber-cyan animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white font-display">Initializing Map</p>
              <p className="text-xs text-gray-500 mt-1">Acquiring GPS data...</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Top HUD Bar ──────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Status */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="glass-subtle hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] uppercase tracking-[0.15em] text-gray-400">
            <span className="text-cyber-cyan">Signal 4/5</span>
            <span className="text-gray-600">|</span>
            <span className="text-emerald-400">GPS 8m</span>
            <span className="text-gray-600">|</span>
            <span className="text-cyber-cyan">Network Online</span>
          </div>
          {emergency.isActive && (
            <div className="glass-subtle flex items-center gap-2 px-4 py-2.5 rounded-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full rounded-full bg-accent-red-400 opacity-75 animate-ping" />
                <span className="relative h-2 w-2 rounded-full bg-accent-red-400" />
              </span>
              <span className="text-xs font-bold text-accent-red-300 uppercase tracking-wider font-display">
                SOS Active
              </span>
              <span className="text-gray-600 mx-1">|</span>
              <ElapsedTimer startTime={emergency.triggeredAt} />
            </div>
          )}
        </div>

        {/* Right: Route info + clock */}
        <div className="pointer-events-auto flex items-center gap-3">
          {routeInfo && (
            <div className="glass-subtle flex items-center gap-4 px-4 py-2.5 rounded-xl">
              <div className="text-right">
                <p className="text-xs font-bold text-white font-display">{routeInfo.duration}</p>
                <p className="text-[10px] text-gray-500">{routeInfo.distance}</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-cyber-cyan/10">
                <span className="text-sm">🚑</span>
              </div>
            </div>
          )}
          <div className="glass-subtle px-4 py-2.5 rounded-xl hidden md:block">
            <LiveClock />
          </div>
        </div>
      </div>

      {/* ── Side Panel (left) — Desktop ───────── */}
      <div className="absolute top-20 left-4 bottom-4 z-20 w-[340px] flex-col gap-3 overflow-y-auto hidden lg:flex scrollbar-thin pr-1">
        <EmergencyInfoCard loading={loading} />
        <NearestHospitalCard
          hospital={selectedHospital}
          distanceKm={selectedDistanceKm}
          routeDistance={routeInfo?.distance}
          routeDuration={routeInfo?.duration}
          routeSteps={routeInfo?.steps}
          routeSource={routeInfo?.source}
          userLocation={userLocation}
          loading={loading}
        />
        <StatusTracker
          loading={loading}
          emergencyActive={emergency.isActive}
          routeReady={routeInfo !== null}
        />
      </div>

      {/* ── Bottom Bar (mobile) ──────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 lg:hidden">
        <div className="glass rounded-t-2xl rounded-b-none p-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%] h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%] h-4 w-3/4 rounded-md" />
                <div className="animate-shimmer bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] bg-[length:200%_100%] h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ) : selectedHospital ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20">
                  <span className="text-lg">🏥</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedHospital.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {routeInfo?.distance ?? (selectedDistanceKm !== null ? `${selectedDistanceKm.toFixed(1)} km` : '—')}
                    {routeInfo?.duration ? ` · ${routeInfo.duration}` : ''}
                  </p>
                </div>
              </div>
              {emergency.isActive && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-red-400 animate-pulse" />
                  <ElapsedTimer startTime={emergency.triggeredAt} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">No nearby hospitals found</p>
          )}
        </div>
      </div>
    </main>
  );
}
