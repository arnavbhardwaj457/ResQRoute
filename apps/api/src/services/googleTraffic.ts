import { LatLng } from '../utils/geo';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { RouteCandidate } from './routeScoring';

type DirectionsApiRoute = {
  legs?: Array<{
    distance?: { value?: number };
    duration?: { value?: number };
    duration_in_traffic?: { value?: number };
  }>;
  overview_polyline?: { points?: string };
};

type DirectionsApiResponse = {
  status?: string;
  routes?: DirectionsApiRoute[];
  error_message?: string;
};

export type TrafficRouteCandidate = RouteCandidate & {
  encodedPolyline?: string;
};

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries: number, retryDelayMs: number) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Directions API request failed with ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn('Traffic API attempt failed', {
        attempt,
        retries,
        error: lastError.message,
      });

      if (attempt < retries) {
        await delay(retryDelayMs * attempt);
      }
    }
  }

  throw lastError ?? new Error('Traffic API request failed after retries');
}

export async function fetchTrafficAwareRoutes(
  origin: LatLng,
  destination: LatLng,
  apiKey: string,
  mode: 'driving' | 'walking' | 'biking' = 'driving',
): Promise<TrafficRouteCandidate[]> {
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode,
    alternatives: 'true',
    departure_time: 'now',
    traffic_model: 'best_guess',
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
  const response = await fetchWithRetry(url, env.TRAFFIC_API_RETRY_MAX, env.TRAFFIC_API_RETRY_DELAY_MS);

  const data = (await response.json()) as DirectionsApiResponse;
  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error(data.error_message ?? `Google Directions API status: ${data.status ?? 'UNKNOWN'}`);
  }

  return data.routes
    .map((route, index) => {
      const leg = route.legs?.[0];
      const meters = leg?.distance?.value ?? 0;
      const normalDurationSeconds = leg?.duration?.value ?? 0;
      const trafficDurationSeconds = leg?.duration_in_traffic?.value ?? normalDurationSeconds;

      const distanceKm = meters / 1000;
      const durationMinutes = trafficDurationSeconds / 60;
      const congestion =
        normalDurationSeconds > 0
          ? Math.max(0, (trafficDurationSeconds - normalDurationSeconds) / normalDurationSeconds)
          : 0;

      return {
        id: `google-${index + 1}`,
        distance: Number(distanceKm.toFixed(2)),
        duration: Number(durationMinutes.toFixed(2)),
        traffic: Number(congestion.toFixed(4)),
        encodedPolyline: route.overview_polyline?.points,
      };
    })
    .filter((route) => route.distance > 0 && route.duration > 0);
}
