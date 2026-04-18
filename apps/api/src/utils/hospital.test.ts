import assert from 'node:assert/strict';
import test from 'node:test';
import { getNearestHospital } from './hospital';

type TestHospital = {
  name: string;
  location: { lat: number; lng: number };
};

const userLocation = { lat: 40.7128, lng: -74.006 };

const hospitals: TestHospital[] = [
  { name: 'Hospital A', location: { lat: 40.758, lng: -73.9855 } },
  { name: 'Hospital B', location: { lat: 40.711, lng: -74.012 } },
  { name: 'Hospital C', location: { lat: 40.706, lng: -74.0086 } },
  { name: 'Hospital D', location: { lat: 40.7812, lng: -73.9665 } },
];

test('getNearestHospital returns the closest hospital', () => {
  const result = getNearestHospital(userLocation.lat, userLocation.lng, hospitals);

  assert.ok(result.nearestHospital);
  assert.equal(result.nearestHospital.hospital.name, 'Hospital B');
});

test('getNearestHospital returns top 3 hospitals sorted by distance', () => {
  const result = getNearestHospital(userLocation.lat, userLocation.lng, hospitals);

  assert.equal(result.topHospitals.length, 3);
  assert.equal(result.topHospitals[0]?.hospital.name, 'Hospital B');
  assert.equal(result.topHospitals[1]?.hospital.name, 'Hospital C');
  assert.equal(result.topHospitals[2]?.hospital.name, 'Hospital A');

  const [first, second, third] = result.topHospitals;
  assert.ok(first && second && third);
  assert.ok(first.distanceKm <= second.distanceKm);
  assert.ok(second.distanceKm <= third.distanceKm);
});

test('getNearestHospital handles empty hospital list', () => {
  const result = getNearestHospital(userLocation.lat, userLocation.lng, []);

  assert.equal(result.nearestHospital, null);
  assert.equal(result.topHospitals.length, 0);
});
