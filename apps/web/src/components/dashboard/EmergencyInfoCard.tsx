'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { useAppStore } from '@/store';
import { StatusBadge } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { reverseGeocode } from '@/lib/maps';

export function EmergencyInfoCard({ loading = false }: { loading?: boolean }) {
  const emergency = useAppStore((s) => s.emergency);
  const cardRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!cardRef.current || loading) return;
    anime({
      targets: cardRef.current,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: 200,
      easing: 'easeOutCubic',
    });
  }, [loading]);

  // Reverse geocode when location changes
  useEffect(() => {
    if (!emergency.location) return;
    reverseGeocode(emergency.location).then((addr) => {
      if (addr) {
        // Shorten the address to just the relevant parts
        const parts = addr.split(',').slice(0, 3).join(',');
        setAddress(parts);
      }
    });
  }, [emergency.location]);

  useEffect(() => {
    if (!emergency.triggeredAt) {
      setElapsed('00:00');
      return;
    }

    const start = new Date(emergency.triggeredAt).getTime();
    const tick = () => {
      const total = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const mins = String(Math.floor(total / 60)).padStart(2, '0');
      const secs = String(total % 60).padStart(2, '0');
      setElapsed(`${mins}:${secs}`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [emergency.triggeredAt]);

  if (loading) {
    return (
      <div className="cyber-card p-5 space-y-3">
        <Skeleton variant="line" className="w-24 h-3" />
        <Skeleton variant="rect" className="w-full h-16" />
        <div className="space-y-2">
          <Skeleton variant="line" className="w-full" />
          <Skeleton variant="line" className="w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="cyber-card p-5" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="hud-label">
          Emergency Info
        </h3>
        <div className="flex items-center gap-2">
          {emergency.isActive && <span className="h-2 w-2 rounded-full bg-accent-red-400 animate-ping" />}
          {emergency.isActive && (
            <StatusBadge label="Critical" variant="error" />
          )}
        </div>
      </div>

      {emergency.isActive && emergency.location ? (
        <>
          {/* Alert box */}
          <div className="rounded-xl p-4 mb-4" style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-red-500/15 flex-shrink-0">
                <svg className="h-5 w-5 text-accent-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white font-display">SOS Active</p>
                <p className="text-[11px] text-gray-400">
                  {emergency.triggeredAt
                    ? new Date(emergency.triggeredAt).toLocaleTimeString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Address if available */}
          {address && (
            <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</p>
              <p className="text-xs text-gray-300 leading-relaxed">{address}</p>
            </div>
          )}

          {/* Coordinates */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Live Timer</span>
              <span className="text-xs font-mono text-accent-red-300 animate-pulse">{elapsed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Latitude</span>
              <span className="text-xs font-mono text-cyber-cyan">
                {emergency.location.lat.toFixed(6)}°
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Longitude</span>
              <span className="text-xs font-mono text-cyber-cyan">
                {emergency.location.lng.toFixed(6)}°
              </span>
            </div>
            <div className="hud-divider" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status</span>
              <StatusBadge label="Reported" variant="warning" />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-3xl mb-3 opacity-30">🛡️</div>
          <p className="text-sm text-gray-500">No active emergency</p>
          <p className="text-[11px] text-gray-600 mt-1">Tap SOS on home to trigger</p>
        </div>
      )}
    </div>
  );
}

export default EmergencyInfoCard;
