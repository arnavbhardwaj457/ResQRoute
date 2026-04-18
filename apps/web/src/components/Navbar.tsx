import Link from 'next/link';
import { GlowButton } from './GlowButton';

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-lg font-semibold tracking-wide text-blue-200">
          ResQRoute
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/tracking" className="text-sm text-slate-300 hover:text-white">
            Tracking
          </Link>
          <Link href="/hospital" className="text-sm text-slate-300 hover:text-white">
            Hospital
          </Link>
          <GlowButton type="button">Dispatch</GlowButton>
        </div>
      </nav>
    </header>
  );
}
