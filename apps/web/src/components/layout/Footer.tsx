'use client';

import Link from 'next/link';

const footerLinks = {
  platform: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Hospital Network', href: '/hospitals' },
    { label: 'Live Map', href: '/dashboard' },
    { label: 'About Us', href: '/about' },
  ],
  resources: [
    { label: 'API Documentation', href: '/docs' },
    { label: 'System Status', href: '/status' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Developer Portal', href: '/developers' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Data Protection', href: '/data-protection' },
    { label: 'Contact', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer id="main-footer" className="relative" style={{ borderTop: '1px solid rgba(0, 240, 255, 0.06)' }}>
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* ── Brand Column ─────────────────── */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #00b8c7)',
                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)',
                }}
              >
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <span className="text-base font-bold text-white font-display">
                Res<span className="text-cyber-cyan">Q</span>Route
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              India&apos;s smartest emergency response platform. Real-time routing,
              hospital coordination, and life-saving dispatch — all in one tap.
            </p>

            {/* Made in India badge */}
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
              style={{
                background: 'rgba(0, 240, 255, 0.04)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
              }}
            >
              <span>🇮🇳</span>
              <span className="text-gray-400">Made in India</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">Emergency</span>
              <span className="font-mono font-bold text-accent-red-400">112</span>
            </div>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">Partners</p>
              <div className="flex flex-wrap gap-2">
                {['City EMS', 'Metro Health', 'State ER Grid'].map((partner) => (
                  <span
                    key={partner}
                    className="rounded-lg px-2.5 py-1 text-[10px] text-gray-400"
                    style={{ border: '1px solid rgba(0,240,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-2">Newsletter</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  required
                  placeholder="name@hospital.in"
                  className="w-full rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 bg-white/[0.03] outline-none"
                  style={{ border: '1px solid rgba(0,240,255,0.08)' }}
                />
                <button className="btn-primary px-3 py-2 rounded-lg text-xs" type="submit">
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* ── Link Columns ─────────────────── */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="hud-label mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={`${category}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors duration-200 hover:text-cyber-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ──────────────────────── */}
        <div
          className="mt-16 flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{ borderTop: '1px solid rgba(0, 240, 255, 0.06)' }}
        >
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ResQRoute Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-white/5 hover:text-cyber-cyan"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-white/5 hover:text-cyber-cyan"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-all hover:bg-white/5 hover:text-cyber-cyan"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-gray-600">
          Healthcare data notice: ResQRoute follows HIPAA-aligned handling patterns and India DPDP-focused privacy controls for emergency metadata.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
