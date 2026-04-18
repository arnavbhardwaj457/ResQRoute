import { Router } from 'express';
import { z } from 'zod';
import { HospitalModel } from '../models/Hospital';
import { getNearestHospital } from '../utils/hospital';

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

const hospitalsRouter = Router();

hospitalsRouter.get('/', async (req, res, next) => {
  try {
    const { lat, lng } = querySchema.parse(req.query);
    const hospitals = await HospitalModel.find().lean();

    if (typeof lat === 'number' && typeof lng === 'number') {
      const { nearestHospital, topHospitals } = getNearestHospital(lat, lng, hospitals);

      const hospitalsWithDistance = topHospitals.map((entry) => ({
        ...entry.hospital,
        distanceKm: Number(entry.distanceKm.toFixed(2)),
      }));

      return res.json({
        hospitals: hospitalsWithDistance,
        nearestHospital: nearestHospital
          ? {
              ...nearestHospital.hospital,
              distanceKm: Number(nearestHospital.distanceKm.toFixed(2)),
            }
          : null,
      });
    }

    return res.json({ hospitals, nearestHospital: null });
  } catch (error) {
    return next(error);
  }
});

export { hospitalsRouter };
