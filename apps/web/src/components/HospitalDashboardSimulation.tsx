'use client';

import anime from 'animejs';
import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { env } from '../env';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

type EmergencyAlertPayload = {
  alertId: string;
  patientLocation: {
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  severity: 'high' | 'critical';
  timestamp: string;
};

type Decision = 'accepted' | 'rejected';

type AlertState = EmergencyAlertPayload & {
  decision?: Decision;
  decidedAt?: string;
};

export function HospitalDashboardSimulation() {
  const listRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  useEffect(() => {
    const socket = io(env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('emergency:alert', (payload: EmergencyAlertPayload) => {
      setAlerts((prev) => {
        const exists = prev.some((item) => item.alertId === payload.alertId);
        if (exists) return prev;
        return [payload, ...prev].slice(0, 8);
      });
    });

    socket.on(
      'emergency:decision:update',
      (payload: { alertId: string; decision: Decision; updatedAt: string }) => {
        setAlerts((prev) =>
          prev.map((item) =>
            item.alertId === payload.alertId
              ? { ...item, decision: payload.decision, decidedAt: payload.updatedAt }
              : item,
          ),
        );
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    anime({
      targets: listRef.current.querySelectorAll('.hospital-alert-card'),
      opacity: [0, 1],
      translateY: [16, 0],
      easing: 'easeOutCubic',
      delay: anime.stagger(70),
      duration: 450,
    });
  }, [alerts]);

  const respondToAlert = (alertId: string, decision: Decision) => {
    socketRef.current?.emit('emergency:decision', { alertId, decision });

    setAlerts((prev) =>
      prev.map((item) =>
        item.alertId === alertId
          ? { ...item, decision, decidedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-300">Hospital Console</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-100">Emergency Intake Dashboard</h1>
          </div>
          <StatusBadge label="Live Feed" variant="info" />
        </div>

        <div className="mt-6" ref={listRef}>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-300">
              Waiting for emergency alerts from backend event stream...
            </div>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <section
                  key={alert.alertId}
                  className="hospital-alert-card rounded-2xl border border-white/10 bg-slate-900/55 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-slate-100">{alert.alertId}</p>
                        <StatusBadge variant={alert.severity === 'critical' ? 'error' : 'warning'} label={alert.severity.toUpperCase()} />
                      </div>
                      <p className="mt-2 text-sm text-slate-200">
                        Patient location: {alert.patientLocation.lat.toFixed(6)}, {alert.patientLocation.lng.toFixed(6)}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">ETA: {alert.etaMinutes} minutes</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Received: {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={Boolean(alert.decision)}
                        onClick={() => respondToAlert(alert.alertId, 'accepted')}
                        className="rounded-lg border border-emerald-300/35 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(alert.decision)}
                        onClick={() => respondToAlert(alert.alertId, 'rejected')}
                        className="rounded-lg border border-red-300/35 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {alert.decision ? (
                    <p className="mt-3 text-xs text-slate-300">
                      Decision: {alert.decision.toUpperCase()} at{' '}
                      {alert.decidedAt ? new Date(alert.decidedAt).toLocaleTimeString() : 'now'}
                    </p>
                  ) : null}
                </section>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </main>
  );
}
