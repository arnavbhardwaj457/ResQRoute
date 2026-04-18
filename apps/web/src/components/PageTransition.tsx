'use client';

import anime from 'animejs';
import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    anime.remove(wrapperRef.current);
    anime({
      targets: wrapperRef.current,
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 550,
      easing: 'easeOutCubic',
    });
  }, [pathname]);

  return <div ref={wrapperRef}>{children}</div>;
}
