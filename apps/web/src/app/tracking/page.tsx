'use client';

import dynamic from 'next/dynamic';

const TrackingExperience = dynamic(
  () => import('../../components/TrackingExperience').then((module) => module.TrackingExperience),
  {
    ssr: false,
    loading: () => (
      <main className="mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
        <div className="min-h-[calc(100vh-146px)] animate-pulse rounded-3xl border border-white/10 bg-slate-900/35" />
      </main>
    ),
  },
);

export default function TrackingPage() {
  return <TrackingExperience />;
}
