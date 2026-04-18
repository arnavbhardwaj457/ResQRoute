import type { LatLng } from '@resqroute/types';
import { env } from '@/env';

/* ─────────────────────────────────────────────
   Maps Utility — OSRM Routing (Free, no API key)
   Uses OpenStreetMap + OSRM for Indian roads
   ───────────────────────────────────────────── */

const OSRM_BASE = env.NEXT_PUBLIC_OSRM_ENDPOINT;
const OSRM_TIMEOUT_MS = 7000;
const routeCache = new Map<string, OSRMRoute>();

export interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][]; // [lng, lat][] decoded coords
  steps: string[];
}

export interface HospitalCandidate {
  id: string;
  location: LatLng;
  emergencyAvailable: boolean;
}

export interface FastestHospitalResult {
  hospitalId: string;
  route: OSRMRoute;
}

interface OSRMManeuver {
  type?: string;
  modifier?: string;
}

interface OSRMStep {
  name?: string;
  maneuver?: OSRMManeuver;
}

interface OSRMLeg {
  steps?: OSRMStep[];
}

interface OSRMRouteResponse {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs?: OSRMLeg[];
}

function routeCacheKey(origin: LatLng, destination: LatLng): string {
  return [
    origin.lat.toFixed(5),
    origin.lng.toFixed(5),
    destination.lat.toFixed(5),
    destination.lng.toFixed(5),
  ].join('|');
}

function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toStepInstruction(step: OSRMStep): string {
  const maneuverType = step?.maneuver?.type as string | undefined;
  const modifier = step?.maneuver?.modifier as string | undefined;
  const roadName = step?.name ? ` on ${step.name}` : '';

  if (maneuverType === 'depart') return `Start${roadName}`;
  if (maneuverType === 'arrive') return 'Arrive at destination';
  if (maneuverType === 'roundabout') return `Take the roundabout${roadName}`;
  if (maneuverType === 'turn') {
    return `Turn ${modifier ?? 'ahead'}${roadName}`;
  }
  if (maneuverType === 'merge') return `Merge${roadName}`;
  if (maneuverType === 'new name') return `Continue${roadName}`;
  return `Continue${roadName}`;
}

/**
 * Get driving route between two points via OSRM (free).
 * Works on Indian roads via OpenStreetMap data.
 */
export async function getOSRMRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<OSRMRoute | null> {
  try {
    const cacheKey = routeCacheKey(origin, destination);
    const cached = routeCache.get(cacheKey);
    if (cached) return cached;

    const url = `${OSRM_BASE}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    const route = data.routes[0] as OSRMRouteResponse;
    const steps = (route.legs ?? [])
      .flatMap((leg: OSRMLeg) => leg.steps ?? [])
      .map((step: OSRMStep) => toStepInstruction(step))
      .filter(Boolean)
      .slice(0, 6);

    const parsed = {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry.coordinates as [number, number][],
      steps,
    };
    routeCache.set(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.warn('OSRM routing failed:', err);
    return null;
  }
}

/**
 * Find the earliest-arrival hospital route using OSRM duration.
 * If a route fails, it falls back to a distance-based ETA estimate.
 */
export async function getFastestHospitalRoute(
  origin: LatLng,
  hospitals: HospitalCandidate[],
): Promise<FastestHospitalResult | null> {
  const available = hospitals.filter((h) => h.emergencyAvailable);
  if (available.length === 0) return null;

  const candidates = await Promise.all(
    available.map(async (hospital) => {
      const route = await getOSRMRoute(origin, hospital.location);
      if (route) {
        return { hospitalId: hospital.id, route, score: route.duration };
      }

      // Fallback score using conservative city-speed estimate.
      const km = haversineDistanceKm(origin, hospital.location);
      const fallbackDuration = Math.max(60, km * 150);
      return {
        hospitalId: hospital.id,
        route: {
          distance: km * 1000,
          duration: fallbackDuration,
          geometry: [
            [origin.lng, origin.lat] as [number, number],
            [hospital.location.lng, hospital.location.lat] as [number, number],
          ],
          steps: ['Proceed to the destination using the main route'],
        },
        score: fallbackDuration,
      };
    }),
  );

  const fastest = candidates.reduce((best, current) =>
    current.score < best.score ? current : best,
  );

  return {
    hospitalId: fastest.hospitalId,
    route: fastest.route,
  };
}

/**
 * Format meters to human-readable distance string.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format seconds to human-readable duration string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

/**
 * Reverse geocode coordinates to an address via Nominatim (free).
 */
export async function reverseGeocode(location: LatLng): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en-IN,en;q=0.9' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

/**
 * Dark-themed tile URL for Leaflet maps.
 * CartoDB Dark Matter — no API key needed.
 */
export const DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
