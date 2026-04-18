'use client';

import anime from 'animejs';
import { ButtonHTMLAttributes, useEffect, useRef } from 'react';

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function GlowButton({ className, children, ...props }: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    let pulseAnimation: anime.AnimeInstance | null = null;

    const handleMouseEnter = () => {
      pulseAnimation = anime({
        targets: button,
        boxShadow: [
          '0 0 0 rgba(59, 130, 246, 0)',
          '0 0 24px rgba(59, 130, 246, 0.45)',
          '0 0 10px rgba(248, 113, 113, 0.35)',
        ],
        scale: [1, 1.02, 1],
        duration: 900,
        easing: 'easeOutSine',
        loop: true,
      });

      anime({
        targets: button,
        backgroundPosition: ['0% 50%', '100% 50%'],
        easing: 'linear',
        duration: 1300,
      });
    };

    const handleMouseLeave = () => {
      pulseAnimation?.pause();
      anime.remove(button);
      anime({
        targets: button,
        boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
        scale: 1,
        backgroundPosition: '0% 50%',
        duration: 300,
        easing: 'easeOutQuad',
      });
    };

    const handleClick = () => {
      anime.remove(button);
      anime({
        targets: button,
        scale: [1, 0.96, 1.02, 1],
        duration: 320,
        easing: 'easeOutBack',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('click', handleClick);

    return () => {
      pulseAnimation?.pause();
      anime.remove(button);
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={
        `rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-500 via-sky-400 to-red-500 bg-[length:200%_200%] px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-blue-400 hover:to-red-400 ${className ?? ''}`.trim()
      }
      {...props}
    >
      {children}
    </button>
  );
}
