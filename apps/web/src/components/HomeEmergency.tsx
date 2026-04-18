'use client';

import anime from 'animejs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { useRouteStore } from '../store/useRouteStore';

type LatLng = {
  lat: number;
  lng: number;
};

function randomCoordinate(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(6));
}

function generateRandomLatLng(): LatLng {
  return {
    lat: randomCoordinate(-90, 90),
    lng: randomCoordinate(-180, 180),
  };
}

function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0,
      },
    );
  });
}

export function HomeEmergency() {
  const router = useRouter();
  const sosButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTriggering, setTriggering] = useState(false);
  const [locationSource, setLocationSource] = useState<'geolocation' | 'random' | null>(null);

  const { triggerEmergency, setDestination } = useRouteStore();

  useEffect(() => {
    const button = sosButtonRef.current;
    const background = backgroundRef.current;
    if (!button || !background) return;

    const pulse = anime({
      targets: button,
      scale: [1, 1.08],
      boxShadow: [
        '0 0 0 0 rgba(239, 68, 68, 0.35)',
        '0 0 0 16px rgba(239, 68, 68, 0)',
      ],
      easing: 'easeInOutSine',
      duration: 1200,
      direction: 'alternate',
      loop: true,
    });

    const gradientFlow = anime({
      targets: background,
      backgroundPosition: ['0% 50%', '100% 50%'],
      easing: 'linear',
      duration: 7000,
      direction: 'alternate',
      loop: true,
    });

    return () => {
      pulse.pause();
      gradientFlow.pause();
      anime.remove(button);
      anime.remove(background);
    };
  }, []);

  async function handleConfirmEmergency() {
    setTriggering(true);

    let location: LatLng;
    let source: 'geolocation' | 'random';

    try {
      location = await getCurrentPosition();
      source = 'geolocation';
    } catch {
      location = generateRandomLatLng();
      source = 'random';
    }

    triggerEmergency(location);
    setDestination({
      lat: Number((location.lat + 0.02).toFixed(6)),
      lng: Number((location.lng + 0.02).toFixed(6)),
    });
    setLocationSource(source);

    setModalOpen(false);
    setTriggering(false);
    router.push('/dashboard');
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-6xl flex-col items-center justify-center px-4 py-10 md:px-8">
      <div
        ref={backgroundRef}
        className="absolute inset-0 -z-10 rounded-[2rem] bg-[linear-gradient(120deg,rgba(239,68,68,0.22),rgba(59,130,246,0.22),rgba(239,68,68,0.22))] bg-[length:220%_220%]"
      />

      <GlassCard className="w-full max-w-2xl p-8 text-center md:p-12">
        <p className="text-xs uppercase tracking-[0.26em] text-blue-300">Emergency Network</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-100 md:text-6xl">ResQRoute</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 md:text-base">
          Tap SOS to trigger emergency dispatch. Your location will be captured via browser geolocation,
          or generated as fallback if unavailable.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <button
            ref={sosButtonRef}
            type="button"
            className="flex h-48 w-48 items-center justify-center rounded-full border border-red-300/40 bg-gradient-to-br from-red-500 to-red-700 text-4xl font-bold text-white shadow-[0_0_60px_rgba(239,68,68,0.35)] md:h-56 md:w-56"
            onClick={() => setModalOpen(true)}
          >
            SOS
          </button>

          <StatusBadge
            label={
              locationSource
                ? `Last source: ${locationSource === 'geolocation' ? 'Browser geolocation' : 'Random fallback'}`
                : 'Awaiting trigger'
            }
            variant={locationSource ? 'info' : 'warning'}
          />
        </div>
      </GlassCard>

      {isModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-4">
          <GlassCard className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-slate-100">Confirm Emergency Trigger</h2>
            <p className="mt-3 text-sm text-slate-300">
              This action will notify the emergency workflow and redirect to the live dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergency}
                disabled={isTriggering}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isTriggering ? 'Triggering...' : 'Trigger Emergency'}
              </button>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </main>
  );
}
