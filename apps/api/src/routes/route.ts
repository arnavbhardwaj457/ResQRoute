import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { estimateEtaMinutes, haversineDistanceKm, mockRoutePolyline } from '../utils/geo';
import { fetchTrafficAwareRoutes } from '../services/googleTraffic';
import { logger } from '../utils/logger';
import {
  isCurrentPeakHour,
  RuleBasedRouteOptimizer,
} from '../services/ruleBasedRouteOptimizer';

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const routeCandidateSchema = z.object({
  id: z.string().optional(),
  distance: z.number().positive(),
  duration: z.number().positive(),
  traffic: z.number().min(0),
});

const routeRequestSchema = z.object({
  origin: latLngSchema.optional(),
  destination: latLngSchema.optional(),
  routes: z.array(routeCandidateSchema).min(1).optional(),
  mode: z.enum(['driving', 'walking', 'biking']).default('driving'),
  scoring: z
    .object({
      trafficWeight: z.number().min(0).default(1.0),
      avgSpeed: z.number().positive().default(40),
      highTrafficThreshold: z.number().min(0).default(0.45),
      highTrafficMultiplier: z.number().min(0).default(1.4),
      peakHourDelayFactor: z.number().min(0).default(0.12),
      isPeakHour: z.boolean().optional(),
    })
    .default({
      trafficWeight: 1.0,
      avgSpeed: 40,
      highTrafficThreshold: 0.45,
      highTrafficMultiplier: 1.4,
      peakHourDelayFactor: 0.12,
    }),
}).superRefine((payload, ctx) => {
  const hasExplicitRoutes = Array.isArray(payload.routes) && payload.routes.length > 0;
  const hasCoordinates = Boolean(payload.origin && payload.destination);

  if (!hasExplicitRoutes && !hasCoordinates) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide either routes[] or origin + destination.',
      path: ['routes'],
    });
  }
});

const routeRouter = Router();
const routeOptimizer = new RuleBasedRouteOptimizer();

function buildShortestPathFallback(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const distanceKm = haversineDistanceKm(origin, destination);
  const etaMinutes = estimateEtaMinutes(distanceKm);

  return {
    id: 'fallback-shortest-path',
    distance: Number(distanceKm.toFixed(2)),
    duration: etaMinutes,
    traffic: 0,
  };
}

routeRouter.post('/', async (req, res, next) => {
  try {
    const payload = routeRequestSchema.parse(req.body);
    const origin = payload.origin;
    const destination = payload.destination;

    const isPeakHour = payload.scoring.isPeakHour ?? isCurrentPeakHour();

    let provider: 'google_maps_directions' | 'fallback_shortest_path' | 'client' = 'client';
    let candidateRoutes = payload.routes ?? [];

    if (candidateRoutes.length === 0 && origin && destination) {
      if (env.GOOGLE_MAPS_API_KEY) {
        try {
          candidateRoutes = await fetchTrafficAwareRoutes(
            origin,
            destination,
            env.GOOGLE_MAPS_API_KEY,
            payload.mode,
          );
          provider = 'google_maps_directions';
        } catch (error) {
          logger.warn('Traffic route fetch failed; using shortest-path fallback', {
            error: error instanceof Error ? error.message : String(error),
          });
          candidateRoutes = [];
        }
      }

      if (candidateRoutes.length === 0) {
        candidateRoutes = [buildShortestPathFallback(origin, destination)];
        provider = 'fallback_shortest_path';
      }
    }

    const result = routeOptimizer.optimize(candidateRoutes, {
      trafficWeight: payload.scoring.trafficWeight,
      avgSpeed: payload.scoring.avgSpeed,
      isPeakHour,
      highTrafficThreshold: payload.scoring.highTrafficThreshold,
      highTrafficMultiplier: payload.scoring.highTrafficMultiplier,
      peakHourDelayFactor: payload.scoring.peakHourDelayFactor,
    });

    return res.json({
      bestRoute: result.bestRoute,
      routes: result.rankedRoutes,
      scoring: {
        strategy: 'rule_based_a_star_v1',
        modelUpgradeReady: true,
        trafficWeight: payload.scoring.trafficWeight,
        avgSpeed: payload.scoring.avgSpeed,
        highTrafficThreshold: payload.scoring.highTrafficThreshold,
        highTrafficMultiplier: payload.scoring.highTrafficMultiplier,
        peakHourDelayFactor: payload.scoring.peakHourDelayFactor,
        isPeakHour,
      },
      route: origin && destination
        ? {
        mode: payload.mode,
        distanceKm: result.bestRoute?.distance ?? null,
        etaMinutes: result.bestRoute?.duration ?? null,
        polyline: mockRoutePolyline(origin, destination),
        provider,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
});

export { routeRouter };
