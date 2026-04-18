import { Router } from 'express';
import { z } from 'zod';
import { EmergencyModel } from '../models/Emergency';
import { HospitalModel } from '../models/Hospital';
import { estimateEtaMinutes, mockRoutePolyline } from '../utils/geo';
import { getNearestHospital } from '../utils/hospital';
import { HttpError } from '../middleware/errorHandler';

const emergencyRequestSchema = z.object({
  userId: z.string().min(1).optional(),
  description: z.string().min(3).max(500).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

const emergencyRouter = Router();

emergencyRouter.post('/', async (req, res, next) => {
  try {
    const payload = emergencyRequestSchema.parse(req.body);
    const hospitals = await HospitalModel.find().lean();

    if (hospitals.length === 0) {
      throw new HttpError(404, 'No hospitals available. Seed data is missing.');
    }

    const { nearestHospital: nearest, topHospitals } = getNearestHospital(
      payload.location.lat,
      payload.location.lng,
      hospitals,
    );

    if (!nearest) {
      throw new HttpError(404, 'Unable to determine nearest hospital.');
    }

    const emergency = await EmergencyModel.create({
      userId: payload.userId,
      description: payload.description,
      location: payload.location,
      nearestHospitalId: nearest.hospital._id,
      status: 'active',
    });

    return res.status(201).json({
      emergency,
      nearestHospital: {
        ...nearest.hospital,
        distanceKm: Number(nearest.distanceKm.toFixed(2)),
      },
      route: {
        distanceKm: Number(nearest.distanceKm.toFixed(2)),
        etaMinutes: estimateEtaMinutes(nearest.distanceKm),
        polyline: mockRoutePolyline(payload.location, nearest.hospital.location),
        provider: 'mock',
      },
      topHospitals: topHospitals.map((entry) => ({
        ...entry.hospital,
        distanceKm: Number(entry.distanceKm.toFixed(2)),
      })),
    });
  } catch (error) {
    return next(error);
  }
});

export { emergencyRouter };
