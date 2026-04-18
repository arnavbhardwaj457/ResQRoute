import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { z } from 'zod';
import { env } from './config/env';
import { connectDb } from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { seedHospitals } from './seed/seedHospitals';
import { emergencyRouter } from './routes/emergency';
import { hospitalsRouter } from './routes/hospitals';
import { healthRouter } from './routes/health';
import { routeRouter } from './routes/route';
import { chatRouter } from './routes/chat';
import { logger } from './utils/logger';

type AmbulanceLocationPayload = {
  ambulanceId: string;
  lat: number;
  lng: number;
  heading: number;
  timestamp: string;
};

type EmergencyAlertPayload = {
  alertId: string;
  patientLocation: {
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  severity: 'high' | 'critical';
  timestamp: string;
};

const emergencyDecisionSchema = z.object({
  alertId: z.string().min(1),
  decision: z.enum(['accepted', 'rejected']),
});

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function getAmbulanceLocationAt(nowMs: number): AmbulanceLocationPayload {
  const center = { lat: 40.7128, lng: -74.006 };
  const latRadius = 0.016;
  const lngRadius = 0.02;
  const angle = (nowMs / 2000) * 0.32;

  return {
    ambulanceId: 'AMB-01',
    lat: Number((center.lat + Math.sin(angle) * latRadius).toFixed(6)),
    lng: Number((center.lng + Math.cos(angle) * lngRadius).toFixed(6)),
    heading: Number(normalizeDegrees((angle * 180) / Math.PI).toFixed(2)),
    timestamp: new Date(nowMs).toISOString(),
  };
}

function getEmergencyAlertAt(nowMs: number): EmergencyAlertPayload {
  const slot = Math.floor(nowMs / 12000);
  const latOffset = (pseudoRandom(slot + 1) - 0.5) * 0.04;
  const lngOffset = (pseudoRandom(slot + 2) - 0.5) * 0.04;
  const etaMinutes = Math.max(3, Math.floor(6 + pseudoRandom(slot + 3) * 16));
  const severity = pseudoRandom(slot + 4) > 0.65 ? 'critical' : 'high';

  return {
    alertId: `ALRT-${String(slot).padStart(6, '0')}`,
    patientLocation: {
      lat: Number((40.7128 + latOffset).toFixed(6)),
      lng: Number((-74.006 + lngOffset).toFixed(6)),
    },
    etaMinutes,
    severity,
    timestamp: new Date(slot * 12000).toISOString(),
  };
}

async function bootstrap() {
  await connectDb(env.MONGODB_URI);
  await seedHospitals();

  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
    },
  });

  const ambulanceInterval = setInterval(() => {
    io.emit('ambulance:location', getAmbulanceLocationAt(Date.now()));
  }, 2000);
  io.emit('ambulance:location', getAmbulanceLocationAt(Date.now()));

  const emergencyAlertInterval = setInterval(() => {
    io.emit('emergency:alert', getEmergencyAlertAt(Date.now()));
  }, 12000);
  io.emit('emergency:alert', getEmergencyAlertAt(Date.now()));

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(apiRateLimiter);

  app.use('/health', healthRouter);
  app.use('/emergency', emergencyRouter);
  app.use('/hospitals', hospitalsRouter);
  app.use('/route', routeRouter);
  app.use('/chat', chatRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  io.on('connection', (socket) => {
    socket.emit('server:ready', { connectedAt: new Date().toISOString() });
    socket.emit('ambulance:location', getAmbulanceLocationAt(Date.now()));
    socket.emit('emergency:alert', getEmergencyAlertAt(Date.now()));

    socket.on('route:update', (payload) => {
      socket.broadcast.emit('route:updated', payload);
    });

    socket.on('emergency:decision', (payload) => {
      const parsed = emergencyDecisionSchema.safeParse(payload);
      if (!parsed.success) {
        logger.warn('Rejected invalid emergency decision payload', {
          issues: parsed.error.issues,
        });
        return;
      }

      io.emit('emergency:decision:update', {
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      });
    });
  });

  httpServer.on('close', () => {
    clearInterval(ambulanceInterval);
    clearInterval(emergencyAlertInterval);
  });

  httpServer.listen(env.PORT, () => {
    logger.info('API listening', { url: `http://localhost:${env.PORT}` });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start API', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
