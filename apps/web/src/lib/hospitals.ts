type LatLng = {
  lat: number;
  lng: number;
};

export type HospitalDto = {
  _id: string;
  name: string;
  location: LatLng;
  address: string;
  phone?: string;
  distanceKm?: number;
};

type HospitalsResponse = {
  hospitals: HospitalDto[];
  nearestHospital: HospitalDto | null;
};

type CacheEntry = {
  expiresAt: number;
  value: HospitalsResponse;
};

const TTL_MS = 2 * 60 * 1000;
const memoryCache = new Map<string, CacheEntry>();

function makeKey(apiUrl: string, location: LatLng) {
  const lat = location.lat.toFixed(3);
  const lng = location.lng.toFixed(3);
  return `${apiUrl}|${lat}|${lng}`;
}

function loadFromStorage(key: string): CacheEntry | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(`hospitals:${key}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, entry: CacheEntry) {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(`hospitals:${key}`, JSON.stringify(entry));
}

export async function fetchHospitalsWithCache(apiUrl: string, location: LatLng): Promise<HospitalsResponse> {
  const cacheKey = makeKey(apiUrl, location);
  const now = Date.now();

  const memoryHit = memoryCache.get(cacheKey);
  if (memoryHit && memoryHit.expiresAt > now) {
    return memoryHit.value;
  }

  const storageHit = loadFromStorage(cacheKey);
  if (storageHit && storageHit.expiresAt > now) {
    memoryCache.set(cacheKey, storageHit);
    return storageHit.value;
  }

  const url = new URL('/hospitals', apiUrl);
  url.searchParams.set('lat', String(location.lat));
  url.searchParams.set('lng', String(location.lng));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Hospitals fetch failed with ${response.status}`);
  }

  const payload = (await response.json()) as HospitalsResponse;
  const limited = {
    hospitals: payload.hospitals.slice(0, 3),
    nearestHospital: payload.nearestHospital,
  };

  const entry: CacheEntry = {
    expiresAt: now + TTL_MS,
    value: limited,
  };

  memoryCache.set(cacheKey, entry);
  saveToStorage(cacheKey, entry);

  return limited;
}
