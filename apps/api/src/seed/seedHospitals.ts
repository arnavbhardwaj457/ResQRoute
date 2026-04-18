import { HospitalModel } from '../models/Hospital';

const hospitalSeeds = [
  {
    name: 'St. Aurora Trauma Center',
    address: '112 Aurora Ave, Manhattan, NY',
    phone: '+1-212-555-0141',
    location: { lat: 40.748322, lng: -73.985654 },
  },
  {
    name: 'BlueLine General Hospital',
    address: '78 East River Rd, Queens, NY',
    phone: '+1-718-555-0168',
    location: { lat: 40.74401, lng: -73.948021 },
  },
  {
    name: 'MetroCare Emergency Unit',
    address: '204 West Side Blvd, Brooklyn, NY',
    phone: '+1-347-555-0199',
    location: { lat: 40.678667, lng: -73.944229 },
  },
  {
    name: 'North Harbor Medical',
    address: '19 Harbor Point, Bronx, NY',
    phone: '+1-646-555-0124',
    location: { lat: 40.817352, lng: -73.886563 },
  },
];

export async function seedHospitals() {
  const count = await HospitalModel.countDocuments();
  if (count > 0) return;

  await HospitalModel.insertMany(hospitalSeeds);
}
