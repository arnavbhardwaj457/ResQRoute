'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import anime from 'animejs';
import { useAppStore } from '@/store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { LatLng } from '@resqroute/types';

/* ─────────────────────────────────────────────
   Helper — get location (Indian cities fallback)
   ───────────────────────────────────────────── */

const INDIAN_CITIES: LatLng[] = [
  { lat: 28.6139, lng: 77.2090 },  // Delhi
  { lat: 19.0760, lng: 72.8777 },  // Mumbai
  { lat: 12.9716, lng: 77.5946 },  // Bangalore
  { lat: 13.0827, lng: 80.2707 },  // Chennai
  { lat: 22.5726, lng: 88.3639 },  // Kolkata
  { lat: 17.3850, lng: 78.4867 },  // Hyderabad
];

const DEFAULT_INDIAN_CITY: LatLng = { lat: 28.6139, lng: 77.2090 };

function getLocation(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback: random Indian city
          resolve(
            INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)] ?? DEFAULT_INDIAN_CITY,
          );
        },
        { timeout: 5000, enableHighAccuracy: true },
      );
    } else {
      resolve(DEFAULT_INDIAN_CITY); // Delhi
    }
  });
}

/* ─────────────────────────────────────────────
   Live Clock Component
   ───────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-cyber-cyan">{time}</span>;
}

/* ─────────────────────────────────────────────
   Stats Data
   ───────────────────────────────────────────── */
const STATS = [
  { label: 'Avg Response', value: '< 3 min', icon: '⚡' },
  { label: 'Hospitals', value: '2,400+', icon: '🏥' },
  { label: 'Cities Covered', value: '150+', icon: '🗺️' },
  { label: 'Lives Saved', value: '10K+', icon: '❤️' },
];

const FEATURES = [
  {
    title: 'AI-Powered Routing',
    desc: 'Intelligent path calculation on Indian roads with real-time traffic data for fastest ambulance routes.',
    icon: '🧠',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-cyan-500/20',
  },
  {
    title: 'Live GPS Tracking',
    desc: 'Real-time ambulance tracking with ETA updates. Know exactly when help arrives at your location.',
    icon: '📡',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-emerald-500/20',
  },
  {
    title: 'Hospital Network',
    desc: 'Connected to 2,400+ hospitals across India. Instant bed availability and ER status checks.',
    icon: '🏥',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-violet-500/20',
  },
  {
    title: '24/7 Dispatch',
    desc: 'Round-the-clock emergency dispatch with automated hospital notification and responder coordination.',
    icon: '🚨',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-orange-500/20',
  },
];

/* ─────────────────────────────────────────────
   Home Page
   ───────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const triggerEmergency = useAppStore((s) => s.triggerEmergency);

  const [modalOpen, setModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const sosRef = useRef<HTMLButtonElement>(null);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  /* ── Entrance Animations ──────────────────── */
  useEffect(() => {
    if (!heroRef.current) return;

    anime({
      targets: heroRef.current.querySelectorAll('.hero-anim'),
      translateY: [60, 0],
      opacity: [0, 1],
      duration: 1200,
      delay: anime.stagger(100, { start: 300 }),
      easing: 'easeOutExpo',
    });
  }, []);

  /* ── Stats Animation ──────────────────────── */
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: statsRef.current?.querySelectorAll('.stat-item'),
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 800,
              delay: anime.stagger(100),
              easing: 'easeOutCubic',
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Features Animation ───────────────────── */
  useEffect(() => {
    if (!featuresRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: featuresRef.current?.querySelectorAll('.feature-card'),
              translateY: [40, 0],
              opacity: [0, 1],
              scale: [0.95, 1],
              duration: 800,
              delay: anime.stagger(120),
              easing: 'easeOutCubic',
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── SOS Pulse Loop ───────────────────────── */
  useEffect(() => {
    if (!sosRef.current) return;

    anime({
      targets: sosRef.current,
      scale: [1, 1.04, 1],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true,
    });

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      anime({
        targets: ring,
        scale: [1, 2.5],
        opacity: [0.6, 0],
        duration: 2800,
        delay: i * 700,
        easing: 'easeOutCubic',
        loop: true,
      });
    });
  }, []);

  /* ── SOS Click → Modal ────────────────────── */
  const handleSOSClick = useCallback(() => {
    anime({
      targets: sosRef.current,
      scale: [1, 0.92, 1.08, 1],
      duration: 400,
      easing: 'easeOutBack',
    });
    setModalOpen(true);
  }, []);

  /* ── Confirm Emergency ────────────────────── */
  const handleConfirm = useCallback(async () => {
    setIsTriggering(true);
    const location = await getLocation();
    triggerEmergency(location);
    await new Promise((r) => setTimeout(r, 600));
    router.push('/dashboard');
  }, [triggerEmergency, router]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Animated Background ──────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-accent-red-500/[0.04] blur-[180px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-cyber-cyan/[0.03] blur-[160px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue-500/[0.03] blur-[140px]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(6,10,19,0.8) 100%)' }} />
      </div>

      {/* ══════════════════════════════════════════
         HERO SECTION
         ══════════════════════════════════════════ */}
      <section className="relative z-10 flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-6 py-20">
        <div ref={heroRef} className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Tagline chip */}
          <div
            className="hero-anim mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
            style={{
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(59,130,246,0.06))',
              border: '1px solid rgba(0,240,255,0.15)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-cyan" />
            </span>
            <span className="text-cyber-cyan">Emergency Response System</span>
            <span className="text-gray-500 mx-1">•</span>
            <LiveClock />
          </div>

          {/* Title */}
          <h1
            className="hero-anim text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl"
            style={{ opacity: 0 }}
          >
            Res<span className="text-gradient-cyber">Q</span>Route
          </h1>

          {/* Subtitle */}
          <p
            className="hero-anim mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-400"
            style={{ opacity: 0 }}
          >
            India&apos;s smartest emergency response platform. One tap to alert responders,
            route ambulances on Indian roads, and save lives in{' '}
            <span className="text-cyber-cyan font-semibold">under 3 minutes</span>.
          </p>

          {/* Emergency number */}
          <div
            className="hero-anim mt-4 inline-flex items-center gap-2 text-sm text-gray-500"
            style={{ opacity: 0 }}
          >
            <span>🇮🇳 National Emergency</span>
            <span className="font-mono font-bold text-accent-red-400 text-lg">112</span>
          </div>

          {/* ── SOS Button ─────────────────────── */}
          <div className="hero-anim relative mt-14" style={{ opacity: 0 }}>
            {/* Expanding pulse rings */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <span
                  ref={(el) => { ringRefs.current[i] = el; }}
                  className="block rounded-full"
                style={{
                  width: '200px',
                  height: '200px',
                  opacity: 0,
                  border: '2px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)',
                  transformOrigin: '50% 50%',
                }}
              />
              </span>
            ))}

            {/* The SOS button */}
            <button
              ref={sosRef}
              id="sos-button"
              onClick={handleSOSClick}
              disabled={isTriggering}
              className="
                relative z-10 flex h-[200px] w-[200px] items-center justify-center rounded-full
                text-white
                transition-shadow duration-300
                focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-red-500/40 focus-visible:ring-offset-4 focus-visible:ring-offset-surface
                disabled:opacity-60 disabled:cursor-not-allowed
                cursor-pointer
              "
              style={{
                background: 'radial-gradient(circle at 40% 35%, #f87171, #dc2626 50%, #991b1b)',
                boxShadow: '0 0 30px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.1)',
              }}
              aria-label="Trigger SOS Emergency"
            >
              {/* Inner glow ring */}
              <span
                className="absolute inset-[3px] rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.15), transparent 60%)',
                }}
              />

              {/* Text */}
              <span className="relative flex flex-col items-center gap-1">
                <span className="text-5xl font-black tracking-wider font-display">SOS</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-200/80">
                  Tap for help
                </span>
              </span>
            </button>
          </div>

          {/* Helper text */}
          <p
            className="hero-anim mt-10 text-xs text-gray-600"
            style={{ opacity: 0 }}
          >
            Your location will be shared with emergency responders • Works across India
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
         STATS SECTION
         ══════════════════════════════════════════ */}
      <section ref={statsRef} className="relative z-10 border-y border-white/[0.04] py-16 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-item text-center" style={{ opacity: 0 }}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
         FEATURES SECTION
         ══════════════════════════════════════════ */}
      <section ref={featuresRef} className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="hud-label mb-3">Why ResQRoute</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Built for <span className="text-gradient-cyber">India&apos;s Roads</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              From congested city streets to rural highways, ResQRoute optimizes every second of emergency response.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`feature-card cyber-card p-8 transition-all duration-300 hover:scale-[1.02] ${f.borderColor}`}
                style={{ opacity: 0 }}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} mb-5 text-2xl`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
         CTA SECTION
         ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cyber-card p-12 neon-border">
            <div className="text-5xl mb-6">🇮🇳</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Powered by Indian Emergency Infrastructure
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Connected to 2,400+ hospitals, 150+ cities, and state emergency services.
              ResQRoute is building India&apos;s most comprehensive emergency response network.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleSOSClick}
                className="btn-primary px-8 py-3 rounded-xl font-display text-sm tracking-wider"
              >
                🚨 Emergency SOS
              </button>
              <button
                onClick={() => router.push('/hospitals')}
                className="btn-ghost px-8 py-3 rounded-xl text-sm"
              >
                View Hospital Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Confirm Modal ────────────────────── */}
      <ConfirmModal
        open={modalOpen}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </main>
  );
}
