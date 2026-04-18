'use client';

import anime from 'animejs';
import { ReactNode, useEffect, useRef } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 420,
      easing: 'easeOutCubic',
    });

    const node = cardRef.current;

    const handleEnter = () => {
      anime.remove(node);
      anime({
        targets: node,
        translateY: -4,
        scale: 1.01,
        duration: 220,
        easing: 'easeOutSine',
      });
    };

    const handleLeave = () => {
      anime.remove(node);
      anime({
        targets: node,
        translateY: 0,
        scale: 1,
        duration: 220,
        easing: 'easeOutSine',
      });
    };

    node.addEventListener('mouseenter', handleEnter);
    node.addEventListener('mouseleave', handleLeave);

    return () => {
      anime.remove(node);
      node.removeEventListener('mouseenter', handleEnter);
      node.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section ref={cardRef} className={`glass-card will-change-transform ${className ?? ''}`.trim()}>
      {children}
    </section>
  );
}
