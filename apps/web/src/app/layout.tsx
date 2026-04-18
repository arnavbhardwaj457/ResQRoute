import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutShell } from './LayoutShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://resqroute.in'),
  title: 'ResQRoute — India\'s Emergency Response Platform',
  description:
    'Real-time emergency routing on Indian roads. One tap to alert responders, route ambulances, and save lives in under 3 minutes. Connected to 2,400+ hospitals across India.',
  keywords: [
    'emergency',
    'ambulance',
    'india',
    'hospital',
    'routing',
    'SOS',
    '112',
    'first responders',
    'real-time',
    'GPS tracking',
    'ResQRoute',
  ],
  authors: [{ name: 'ResQRoute Technologies' }],
  creator: 'ResQRoute Technologies Pvt. Ltd.',
  publisher: 'ResQRoute Technologies Pvt. Ltd.',
  openGraph: {
    title: 'ResQRoute — India\'s Emergency Response Platform',
    description:
      'One tap to save a life. Real-time ambulance routing, hospital coordination, and emergency dispatch across India.',
    type: 'website',
    url: 'https://resqroute.in',
    locale: 'en_IN',
    siteName: 'ResQRoute',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResQRoute emergency response platform for India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResQRoute — India\'s Emergency Response Platform',
    description:
      'One tap to save a life. Real-time ambulance routing across India.',
    creator: '@resqroute',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#060a13',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-surface antialiased bg-noise">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
