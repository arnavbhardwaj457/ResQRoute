'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Hospitals', href: '/hospitals' },
  { label: 'About', href: '/about' },
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-[11px] text-cyber-cyan">{time} IST</span>;
}

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const isConnected = useAppStore((s) => s.isConnected);
  const emergency = useAppStore((s) => s.emergency);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!navRef.current) return;

    anime({
      targets: navRef.current,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic',
    });
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        id="main-navbar"
        className="fixed top-0 left-0 right-0 z-50"
        style={{ opacity: 0 }}
      >
        {/* Glass background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(6, 10, 19, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.06)',
          }}
        />

        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* ── Logo ───────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-neon-cyan"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #00b8c7)',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
              }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-display">
              Res<span className="text-cyber-cyan">Q</span>Route
            </span>
          </Link>

          {/* ── Center Nav Links ───────────────── */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'nav-link-active text-cyber-cyan' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ── Right Side ─────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Emergency number */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
              <span>🇮🇳</span>
              <span className="font-mono font-bold text-accent-red-400">112</span>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-white/10" />

            {/* Clock */}
            <div className="hidden sm:block">
              <LiveClock />
            </div>

            {/* Connection indicator */}
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.08)',
              }}
            >
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isConnected ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
              </span>
              <span className="text-xs font-medium text-gray-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* SOS badge if active */}
            {emergency.isActive && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold animate-pulse"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-red-400" />
                SOS
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden nav-link p-2"
              aria-label="Open menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ─────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-[280px] p-6 pt-20 flex flex-col gap-2"
            style={{
              background: 'rgba(6, 10, 19, 0.97)',
              borderLeft: '1px solid rgba(0, 240, 255, 0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'text-cyber-cyan bg-cyber-cyan/5 border border-cyber-cyan/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-auto pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>🇮🇳 Emergency</span>
                <span className="font-mono font-bold text-accent-red-400 text-base">112</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
