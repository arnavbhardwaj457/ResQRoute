'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Link from 'next/link';

const TEAM = [
  { name: 'Arnav Sharma', role: 'Founder & CEO', emoji: '👨‍💻' },
  { name: 'Dr. Priya Mehta', role: 'Chief Medical Officer', emoji: '👩‍⚕️' },
  { name: 'Rahul Verma', role: 'CTO', emoji: '🧑‍💻' },
  { name: 'Anita Desai', role: 'Head of Operations', emoji: '👩‍💼' },
];

const STATS = [
  { value: '< 3 min', label: 'Average Response Time', icon: '⚡' },
  { value: '2,400+', label: 'Connected Hospitals', icon: '🏥' },
  { value: '150+', label: 'Cities Across India', icon: '🌆' },
  { value: '10,000+', label: 'Lives Impacted', icon: '❤️' },
  { value: '24/7', label: 'Always Available', icon: '🕐' },
  { value: '99.9%', label: 'Uptime SLA', icon: '🛡️' },
];

const INDIA_EMERGENCY_STATS = [
  { label: 'Road Accident Deaths / Year', value: '1.7L+' },
  { label: 'Golden Hour Impact', value: 'Up to 60%' },
  { label: 'Target Dispatch Time', value: '< 180 sec' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tap SOS',
    desc: 'One tap triggers the emergency. Your GPS location is instantly captured and shared.',
    icon: '🚨',
  },
  {
    step: '02',
    title: 'AI Routes',
    desc: 'Our system calculates the fastest route to the nearest hospital on Indian roads in real-time.',
    icon: '🧠',
  },
  {
    step: '03',
    title: 'Hospital Notified',
    desc: 'The nearest ER is alerted with your ETA. Doctors prepare before you arrive.',
    icon: '🏥',
  },
  {
    step: '04',
    title: 'Help Arrives',
    desc: 'Ambulance dispatched. Track it live on the map with real-time ETA updates.',
    icon: '🚑',
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    anime({
      targets: heroRef.current.querySelectorAll('.about-anim'),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(100, { start: 200 }),
      easing: 'easeOutCubic',
    });
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: statsRef.current?.querySelectorAll('.stat-card'),
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 600,
              delay: anime.stagger(80),
              easing: 'easeOutCubic',
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!stepsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: stepsRef.current?.querySelectorAll('.step-card'),
              translateX: [-30, 0],
              opacity: [0, 1],
              duration: 700,
              delay: anime.stagger(120),
              easing: 'easeOutCubic',
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(stepsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-cyber-cyan/[0.02] blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-blue-500/[0.03] blur-[140px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div ref={heroRef} className="mx-auto max-w-4xl text-center">
          <p className="about-anim hud-label mb-4" style={{ opacity: 0 }}>About ResQRoute</p>
          <h1 className="about-anim text-4xl md:text-6xl font-bold text-white font-display mb-6" style={{ opacity: 0 }}>
            Saving Lives on{' '}
            <span className="text-gradient-cyber">Indian Roads</span>
          </h1>
          <p className="about-anim text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8" style={{ opacity: 0 }}>
            Every year, thousands of lives are lost in India due to delayed emergency response.
            ResQRoute was built to change that — using technology to connect people in distress
            with hospitals and responders in under 3 minutes.
          </p>
          <div className="about-anim flex flex-wrap gap-4 justify-center" style={{ opacity: 0 }}>
            <Link href="/" className="btn-primary px-8 py-3 rounded-xl font-display text-sm tracking-wider">
              🚨 Try Emergency SOS
            </Link>
            <Link href="/hospitals" className="btn-ghost px-8 py-3 rounded-xl text-sm">
              View Hospital Network
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 py-16 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="stat-card cyber-card p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={{ opacity: 0 }}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────── */}
      <section ref={stepsRef} className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="hud-label mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
              How It <span className="text-gradient-cyber">Works</span>
            </h2>
          </div>

          <div className="space-y-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="step-card flex items-start gap-6 cyber-card p-6" style={{ opacity: 0 }}>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0 text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(59,130,246,0.05))',
                    border: '1px solid rgba(0,240,255,0.12)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-cyber-cyan/50">{item.step}</span>
                    <h3 className="text-lg font-bold text-white font-display">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <p className="hud-label mb-3">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
              The People Behind{' '}
              <span className="text-gradient-cyber">ResQRoute</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="cyber-card p-6 text-center transition-all duration-300 hover:scale-[1.03]">
                <div className="text-4xl mb-4">{member.emoji}</div>
                <p className="text-sm font-bold text-white">{member.name}</p>
                <p className="text-xs text-gray-500 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-10 px-6">
        <div className="mx-auto max-w-4xl grid md:grid-cols-3 gap-4">
          {INDIA_EMERGENCY_STATS.map((item) => (
            <div key={item.label} className="cyber-card p-5 text-center">
              <p className="text-xl font-display font-bold text-cyber-cyan">{item.value}</p>
              <p className="mt-1 text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission CTA ───────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cyber-card p-12 neon-border">
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-white font-display mb-4">Our Mission</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
              To ensure no life is lost due to delayed emergency response in India.
              We&apos;re building the infrastructure that connects people, hospitals,
              and responders — instantly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/" className="btn-primary px-8 py-3 rounded-xl font-display text-sm tracking-wider">
                Join Our Mission
              </Link>
              <a
                href="mailto:contact@resqroute.in"
                className="btn-ghost px-8 py-3 rounded-xl text-sm"
              >
                Partner With Us
              </a>
            </div>

            <form className="mt-8 grid gap-3 text-left" onSubmit={(e) => e.preventDefault()}>
              <p className="hud-label">City/Hospital Partnership</p>
              <input
                type="text"
                required
                placeholder="Organization name"
                className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 bg-white/[0.03] outline-none"
                style={{ border: '1px solid rgba(0,240,255,0.08)' }}
              />
              <input
                type="email"
                required
                placeholder="official email"
                className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 bg-white/[0.03] outline-none"
                style={{ border: '1px solid rgba(0,240,255,0.08)' }}
              />
              <textarea
                rows={3}
                placeholder="How would you like to partner with ResQRoute?"
                className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 bg-white/[0.03] outline-none"
                style={{ border: '1px solid rgba(0,240,255,0.08)' }}
              />
              <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm w-fit">
                Submit Interest
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
