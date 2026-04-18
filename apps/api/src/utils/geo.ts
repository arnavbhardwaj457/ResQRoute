export type LatLng = {
  lat: number;
  lng: number;
};

export function haversineDistanceKm(a: LatLng, b: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  const arc = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  return earthRadiusKm * arc;
}

export function estimateEtaMinutes(distanceKm: number) {
  const avgSpeedKmPerHour = 40;
  return Math.max(1, Math.round((distanceKm / avgSpeedKmPerHour) * 60));
}

export function mockRoutePolyline(origin: LatLng, destination: LatLng) {
  return [origin, destination];
}
