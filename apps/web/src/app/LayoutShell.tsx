'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, Footer, PageTransition } from '@/components/layout';

/**
 * LayoutShell — Client wrapper around pages.
 * Handles Navbar, Footer, and page transitions.
 * Hides footer on the dashboard page (full-bleed map).
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <>
      <Navbar />
      <div className="pt-[60px]">
        {/* pt offsets the fixed navbar height */}
        <PageTransition>
          {children}
        </PageTransition>
      </div>
      {!isDashboard && <Footer />}
    </>
  );
}
