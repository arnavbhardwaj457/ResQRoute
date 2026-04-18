import { haversineDistanceKm } from './geo';

export type HospitalLike = {
  location: {
    lat: number;
    lng: number;
  };
};

export type RankedHospital<T extends HospitalLike> = {
  hospital: T;
  distanceKm: number;
};

export function getNearestHospital<T extends HospitalLike>(
  userLat: number,
  userLng: number,
  hospitals: T[],
): {
  nearestHospital: RankedHospital<T> | null;
  topHospitals: RankedHospital<T>[];
} {
  if (hospitals.length === 0) {
    return {
      nearestHospital: null,
      topHospitals: [],
    };
  }

  const rankedHospitals = hospitals
    .map((hospital) => ({
      hospital,
      distanceKm: haversineDistanceKm(
        { lat: userLat, lng: userLng },
        { lat: hospital.location.lat, lng: hospital.location.lng },
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    nearestHospital: rankedHospitals[0] ?? null,
    topHospitals: rankedHospitals.slice(0, 3),
  };
}
