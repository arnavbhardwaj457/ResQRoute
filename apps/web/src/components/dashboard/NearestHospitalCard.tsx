'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import type { MockHospital } from '@/lib/mockData';
import type { LatLng } from '@resqroute/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface NearestHospitalCardProps {
  hospital: MockHospital | null;
  distanceKm: number | null;
  routeDistance?: string;
  routeDuration?: string;
  routeSteps?: string[];
  routeSource?: 'osrm' | 'fallback';
  userLocation?: LatLng;
  loading?: boolean;
}

export function NearestHospitalCard({
  hospital,
  distanceKm,
  routeDistance,
  routeDuration,
  routeSteps,
  routeSource,
  userLocation,
  loading = false,
}: NearestHospitalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [etaCountdown, setEtaCountdown] = useState(routeDuration || '—');

  useEffect(() => {
    if (!routeDuration) {
      setEtaCountdown('—');
      return;
    }

    const minMatch = routeDuration.match(/(\d+)\s*min/i);
    if (!minMatch) {
      setEtaCountdown(routeDuration);
      return;
    }

    let remaining = Number(minMatch[1]) * 60;
    const tick = () => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setEtaCountdown(`${mins}:${String(secs).padStart(2, '0')}`);
      remaining = Math.max(0, remaining - 1);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [routeDuration]);

  useEffect(() => {
    if (!cardRef.current || loading) return;
    anime({
      targets: cardRef.current,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 350,
      easing: 'easeOutCubic',
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="cyber-card p-5 space-y-3">
        <Skeleton variant="line" className="w-28 h-3" />
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" className="w-3/4" />
            <Skeleton variant="line" className="w-1/2 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="rect" className="h-16" />
          <Skeleton variant="rect" className="h-16" />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div ref={cardRef} className="cyber-card p-5" style={{ opacity: 0 }}>
        <h3 className="hud-label mb-3">Nearest Hospital</h3>
        <div className="text-center py-6">
          <div className="text-2xl mb-2 opacity-30">🏥</div>
          <p className="text-sm text-gray-500">No hospitals found</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="cyber-card p-5" style={{ opacity: 0 }}>
      {/* Header */}
      <h3 className="hud-label mb-4">Nearest Hospital</h3>

      {/* Hospital info */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(59,130,246,0.05))',
            border: '1px solid rgba(0,240,255,0.15)',
          }}
        >
          <span className="text-lg">🏥</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{hospital.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{hospital.address}</p>
          <p className="text-[11px] text-gray-500">📞 {hospital.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3 text-center" style={{
          background: 'rgba(0,240,255,0.03)',
          border: '1px solid rgba(0,240,255,0.08)',
        }}>
          <p className="text-lg font-bold text-cyber-cyan font-display">
            {routeDistance || (distanceKm !== null ? `${distanceKm.toFixed(1)} km` : '—')}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Distance</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{
          background: 'rgba(0,240,255,0.03)',
          border: '1px solid rgba(0,240,255,0.08)',
        }}>
          <p className="text-lg font-bold text-cyber-cyan font-display">
            <span className="animate-pulse">{etaCountdown}</span>
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">ETA</p>
        </div>
      </div>

      {/* Bed availability bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Bed Availability</span>
          <span className="text-[10px] font-mono text-cyber-cyan">{hospital.beds}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(((hospital.beds / 2500) * 100), 100)}%`,
              background: 'linear-gradient(90deg, #00f0ff, #3b82f6)',
              boxShadow: '0 0 8px rgba(0,240,255,0.4)',
            }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">ER Status</span>
          <span className={`text-xs font-bold ${hospital.emergencyAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${hospital.emergencyAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {hospital.emergencyAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {/* Specialties */}
        {hospital.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hospital.specialties.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(0,240,255,0.06)',
                  border: '1px solid rgba(0,240,255,0.12)',
                  color: 'rgba(0,240,255,0.7)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigate button */}
      {hospital.emergencyAvailable && (
        <>
          <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.08)' }}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Route Quality</p>
            <p className="text-xs text-gray-300">
              {routeSource === 'osrm'
                ? 'Best-route selection: ETA-based (OSRM live routing)'
                : 'Fallback-route selection: distance-based estimate'}
            </p>
          </div>

          {routeSteps && routeSteps.length > 0 && (
            <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Turn by Turn</p>
              <ol className="space-y-1.5">
                {routeSteps.slice(0, 4).map((step, idx) => (
                  <li key={`${idx}-${step}`} className="text-xs text-gray-300 leading-relaxed">
                    <span className="text-cyber-cyan mr-1.5">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const destination = `${hospital.location.lat},${hospital.location.lng}`;
                const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : undefined;
                const url = origin
                  ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
                  : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="btn-primary py-2.5 rounded-xl text-[11px] font-display tracking-wider"
            >
              Google Maps
            </button>

            <button
              onClick={() => {
                const destination = `${hospital.location.lat},${hospital.location.lng}`;
                const start = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
                const url = start
                  ? `http://maps.apple.com/?saddr=${start}&daddr=${destination}&dirflg=d`
                  : `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="btn-ghost py-2.5 rounded-xl text-[11px] tracking-wider"
            >
              Apple Maps
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default NearestHospitalCard;
