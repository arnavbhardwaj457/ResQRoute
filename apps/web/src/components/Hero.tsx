'use client';

import { useEffect } from 'react';
import anime from 'animejs';
import { GlassCard } from './GlassCard';
import { GlowButton } from './GlowButton';

export function Hero() {
  useEffect(() => {
    anime({
      targets: '.hero-item',
      opacity: [0, 1],
      translateY: [24, 0],
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      duration: 850,
    });
  }, []);

  return (
    <GlassCard className="p-8">
      <p className="hero-item text-sm uppercase tracking-[0.2em] text-blue-300">ResQRoute</p>
      <h1 className="hero-item mt-2 text-4xl font-semibold text-slate-100 md:text-5xl">
        Smarter emergency routing, in real time.
      </h1>
      <p className="hero-item mt-4 max-w-2xl text-slate-300">
        Monitor route shifts, incident updates, and responder locations with live sockets and map-aware
        state.
      </p>
      <div className="hero-item mt-6">
        <GlowButton type="button">Open Active Incident</GlowButton>
      </div>
    </GlassCard>
  );
}
