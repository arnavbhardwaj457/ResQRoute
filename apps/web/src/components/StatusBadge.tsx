'use client';

import anime from 'animejs';
import { useEffect, useRef } from 'react';

type StatusVariant = 'ok' | 'warning' | 'error' | 'info';

type StatusBadgeProps = {
  label: string;
  variant: StatusVariant;
};

const variantClasses: Record<StatusVariant, string> = {
  ok: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
  error: 'bg-red-500/15 text-red-300 ring-1 ring-red-400/30',
  info: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30',
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge) return;

    const onEnter = () => {
      anime.remove(badge);
      anime({
        targets: badge,
        scale: [1, 1.06, 1.02],
        duration: 320,
        easing: 'easeOutQuad',
      });
    };

    badge.addEventListener('mouseenter', onEnter);

    return () => {
      anime.remove(badge);
      badge.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <span
      ref={badgeRef}
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-wide will-change-transform ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
