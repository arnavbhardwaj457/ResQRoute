'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import anime from 'animejs';
import { getMockHospitals } from '@/lib/mockData';
import type { MockHospital } from '@/lib/mockData';
import dynamic from 'next/dynamic';

/* ─────────────────────────────────────────────
   Hospitals Directory Page
   ───────────────────────────────────────────── */

const CITIES = [
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
];

type CityOption = (typeof CITIES)[number];
const DEFAULT_CITY: CityOption = { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 };

const HospitalsDirectoryMap = dynamic(
  () => import('@/components/hospitals/HospitalsDirectoryMap').then((mod) => mod.HospitalsDirectoryMap),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full animate-pulse rounded-2xl bg-white/[0.03]" />,
  },
);

export default function HospitalsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption>(CITIES[0] ?? DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState('');

  const hospitals = useMemo(
    () => getMockHospitals({ lat: selectedCity.lat, lng: selectedCity.lng }),
    [selectedCity],
  );

  const filtered = useMemo(() => {
    if (!searchQuery) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.specialties.some((s) => s.toLowerCase().includes(q)),
    );
  }, [hospitals, searchQuery]);

  useEffect(() => {
    if (!heroRef.current) return;
    anime({
      targets: heroRef.current.querySelectorAll('.hosp-anim'),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(100, { start: 200 }),
      easing: 'easeOutCubic',
    });
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    anime({
      targets: gridRef.current.querySelectorAll('.hosp-card'),
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      delay: anime.stagger(60),
      easing: 'easeOutCubic',
    });
  }, [selectedCity, searchQuery]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyber-cyan/[0.02] blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-accent-blue-500/[0.03] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <div ref={heroRef} className="mx-auto max-w-6xl">
          <p className="hosp-anim hud-label mb-4" style={{ opacity: 0 }}>Hospital Network</p>
          <h1 className="hosp-anim text-4xl md:text-5xl font-bold text-white font-display mb-4" style={{ opacity: 0 }}>
            Connected <span className="text-gradient-cyber">Hospitals</span>
          </h1>
          <p className="hosp-anim text-gray-400 max-w-2xl mb-8" style={{ opacity: 0 }}>
            Browse our network of 2,400+ hospitals across India. Filter by city, specialty, and ER availability.
          </p>

          {/* City selector + Search */}
          <div className="hosp-anim flex flex-col md:flex-row gap-4" style={{ opacity: 0 }}>
            {/* City tabs */}
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCity.name === city.name
                      ? 'text-white font-display'
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  style={
                    selectedCity.name === city.name
                      ? {
                          background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(59,130,246,0.05))',
                          border: '1px solid rgba(0,240,255,0.2)',
                          boxShadow: '0 0 12px rgba(0,240,255,0.1)',
                        }
                      : { border: '1px solid rgba(255,255,255,0.05)' }
                  }
                >
                  {city.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search hospitals, specialties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 bg-white/[0.03] outline-none transition-all duration-200 focus:ring-1 focus:ring-cyber-cyan/30"
                  style={{ border: '1px solid rgba(0,240,255,0.08)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hospital Grid ─────────────────────── */}
      <section className="relative z-10 pb-24 px-6">
        <div ref={gridRef} className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="hud-label mb-3">Map View</p>
            <HospitalsDirectoryMap
              hospitals={filtered}
              center={{ lat: selectedCity.lat, lng: selectedCity.lng }}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{filtered.length}</span> hospitals in{' '}
              <span className="text-cyber-cyan">{selectedCity.name}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h) => (
              <HospitalCard key={h.id} hospital={h} origin={selectedCity} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl opacity-30 mb-4">🔍</div>
              <p className="text-gray-500">No hospitals match your search</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ── Hospital Card Component ──────────────── */
function HospitalCard({ hospital, origin }: { hospital: MockHospital; origin: { lat: number; lng: number } }) {
  return (
    <div className="hosp-card cyber-card p-5 transition-all duration-300 hover:scale-[1.02]" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 text-lg"
          style={{
            background: hospital.emergencyAvailable
              ? 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(34,197,94,0.05))'
              : 'rgba(255,255,255,0.03)',
            border: hospital.emergencyAvailable
              ? '1px solid rgba(0,240,255,0.15)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          🏥
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{hospital.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{hospital.address}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.06)' }}>
          <p className="text-[10px] text-gray-500 uppercase">Beds</p>
          <p className="text-sm font-bold text-white font-mono">{hospital.beds}</p>
        </div>
        <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.06)' }}>
          <p className="text-[10px] text-gray-500 uppercase">ER</p>
          <p className={`text-sm font-bold ${hospital.emergencyAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
            {hospital.emergencyAvailable ? 'Open' : 'N/A'}
          </p>
        </div>
        <div className="text-center py-2 rounded-lg" style={{ background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.06)' }}>
          <p className="text-[10px] text-gray-500 uppercase">Call</p>
          <p className="text-[10px] font-mono text-cyber-cyan truncate">{hospital.phone.split(' ').pop()}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {hospital.specialties.map((s) => (
          <span
            key={s}
            className="text-[9px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: 'rgba(0,240,255,0.04)',
              border: '1px solid rgba(0,240,255,0.1)',
              color: 'rgba(0,240,255,0.6)',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-4 flex gap-2">
        <a
          href={`tel:${hospital.phone.replace(/\s/g, '')}`}
          className="flex-1 text-center py-2 rounded-lg text-xs font-medium text-cyber-cyan transition-all hover:bg-cyber-cyan/5"
          style={{ border: '1px solid rgba(0,240,255,0.1)' }}
        >
          📞 Call
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${hospital.location.lat},${hospital.location.lng}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 rounded-lg text-xs font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(59,130,246,0.08))',
            border: '1px solid rgba(0,240,255,0.15)',
          }}
        >
          🧭 Navigate
        </a>
      </div>
    </div>
  );
}
