import type { LatLng } from '@resqroute/types';

export interface MockHospital {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  phone: string;
  beds: number;
  emergencyAvailable: boolean;
  specialties: string[];
}

/* ─────────────────────────────────────────────
   Real India-focused hospital directories.
   We choose a city cluster nearest to the user
   so the map stays realistic across India.
   ───────────────────────────────────────────── */

type HospitalTemplate = Omit<MockHospital, 'id'>;

const CITY_CENTERS = {
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  vellore: { lat: 12.9165, lng: 79.1325 },
};

const HOSPITALS_BY_CITY: Record<keyof typeof CITY_CENTERS, HospitalTemplate[]> = {
  delhi: [
    {
      name: 'AIIMS Delhi',
      address: 'Ansari Nagar East, New Delhi 110029',
      phone: '+91 11 2658 8500',
      beds: 2478,
      emergencyAvailable: true,
      specialties: ['Trauma', 'Cardiology', 'Neurology', 'Oncology'],
      location: { lat: 28.5672, lng: 77.210 },
    },
    {
      name: 'Safdarjung Hospital',
      address: 'Ansari Nagar West, New Delhi 110029',
      phone: '+91 11 2673 0000',
      beds: 1531,
      emergencyAvailable: true,
      specialties: ['Trauma', 'General Surgery', 'Orthopaedics'],
      location: { lat: 28.568, lng: 77.2014 },
    },
    {
      name: 'Max Super Speciality Hospital, Saket',
      address: 'Press Enclave Road, Saket, New Delhi 110017',
      phone: '+91 11 2651 5050',
      beds: 500,
      emergencyAvailable: true,
      specialties: ['Neuroscience', 'Oncology', 'Transplant', 'Orthopaedics'],
      location: { lat: 28.5232, lng: 77.2109 },
    },
    {
      name: 'Indraprastha Apollo Hospitals',
      address: 'Sarita Vihar, New Delhi 110076',
      phone: '+91 11 7179 1090',
      beds: 710,
      emergencyAvailable: true,
      specialties: ['Cardiac Surgery', 'Transplant', 'Robotics'],
      location: { lat: 28.5406, lng: 77.2837 },
    },
    {
      name: 'Fortis Escorts Heart Institute',
      address: 'Okhla Road, New Delhi 110025',
      phone: '+91 11 4713 5000',
      beds: 310,
      emergencyAvailable: true,
      specialties: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery'],
      location: { lat: 28.5608, lng: 77.2741 },
    },
  ],
  mumbai: [
    {
      name: 'Breach Candy Hospital',
      address: '60A Bhulabhai Desai Road, Mumbai 400026',
      phone: '+91 22 2366 7788',
      beds: 275,
      emergencyAvailable: true,
      specialties: ['ICU', 'Cardiac Care', 'Emergency Medicine'],
      location: { lat: 18.9673, lng: 72.8066 },
    },
    {
      name: 'Lilavati Hospital',
      address: 'A-791, Bandra Reclamation, Mumbai 400050',
      phone: '+91 22 6931 8000',
      beds: 323,
      emergencyAvailable: true,
      specialties: ['Trauma', 'Neuro', 'Cardiology'],
      location: { lat: 19.0509, lng: 72.8297 },
    },
    {
      name: 'KEM Hospital',
      address: 'Acharya Donde Marg, Parel, Mumbai 400012',
      phone: '+91 22 2410 7000',
      beds: 1800,
      emergencyAvailable: true,
      specialties: ['Burns', 'Trauma', 'General Medicine'],
      location: { lat: 19.0015, lng: 72.8415 },
    },
    {
      name: 'P. D. Hinduja Hospital',
      address: 'Veer Savarkar Marg, Mahim, Mumbai 400016',
      phone: '+91 22 2445 1515',
      beds: 400,
      emergencyAvailable: true,
      specialties: ['Cardiology', 'Oncology', 'Orthopaedics'],
      location: { lat: 19.0431, lng: 72.8397 },
    },
  ],
  bangalore: [
    {
      name: 'NIMHANS Bengaluru',
      address: 'Hosur Road, Bengaluru 560029',
      phone: '+91 80 2699 5000',
      beds: 1200,
      emergencyAvailable: true,
      specialties: ['Neuro Trauma', 'Psychiatry', 'Neurology'],
      location: { lat: 12.943, lng: 77.5969 },
    },
    {
      name: 'Manipal Hospital, Old Airport Road',
      address: '98 HAL Old Airport Rd, Bengaluru 560017',
      phone: '+91 80 2502 4444',
      beds: 600,
      emergencyAvailable: true,
      specialties: ['Emergency Medicine', 'Cardiology', 'ICU'],
      location: { lat: 12.958, lng: 77.6483 },
    },
    {
      name: 'St. John’s Medical College Hospital',
      address: 'Sarjapur Main Road, Bengaluru 560034',
      phone: '+91 80 2206 5000',
      beds: 1350,
      emergencyAvailable: true,
      specialties: ['Trauma', 'General Surgery', 'Critical Care'],
      location: { lat: 12.9365, lng: 77.6241 },
    },
  ],
  vellore: [
    {
      name: 'CMC Vellore',
      address: 'Ida Scudder Road, Vellore 632004',
      phone: '+91 416 228 1000',
      beds: 3000,
      emergencyAvailable: true,
      specialties: ['Trauma', 'Emergency Medicine', 'Transplant'],
      location: { lat: 12.9249, lng: 79.1357 },
    },
  ],
};

function closestCity(center: LatLng): keyof typeof CITY_CENTERS {
  const entries = Object.entries(CITY_CENTERS) as Array<[keyof typeof CITY_CENTERS, LatLng]>;
  const first = entries[0];
  if (!first) return 'delhi';

  let best = first[0];
  let bestDist = haversineDistance(center, first[1]);

  for (let i = 1; i < entries.length; i += 1) {
    const entry = entries[i];
    if (!entry) continue;
    const [city, location] = entry;
    const dist = haversineDistance(center, location);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return best;
}

/**
 * Generate hospitals around a given center point using real Indian hospital data.
 */
export function getMockHospitals(center: LatLng): MockHospital[] {
  const city = closestCity(center);
  return HOSPITALS_BY_CITY[city].map((h, i) => ({
    id: `hospital-${i + 1}`,
    ...h,
  }));
}

/**
 * Calculate straight-line distance in km between two LatLng points (Haversine).
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
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

/**
 * Find the nearest hospital with ER available from a list.
 */
export function findNearestHospital(
  userLocation: LatLng,
  hospitals: MockHospital[],
): { hospital: MockHospital; distanceKm: number } | null {
  const emergencyHospitals = hospitals.filter((h) => h.emergencyAvailable);
  if (emergencyHospitals.length === 0) return null;

  const first = emergencyHospitals[0];
  if (!first) return null;

  let nearest = first;
  let minDist = haversineDistance(userLocation, nearest.location);

  for (let i = 1; i < emergencyHospitals.length; i++) {
    const candidate = emergencyHospitals[i];
    if (!candidate) continue;
    const dist = haversineDistance(userLocation, candidate.location);
    if (dist < minDist) {
      minDist = dist;
      nearest = candidate;
    }
  }

  return { hospital: nearest, distanceKm: minDist };
}
