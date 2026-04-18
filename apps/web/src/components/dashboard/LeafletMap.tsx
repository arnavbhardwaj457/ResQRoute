'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { LatLng } from '@resqroute/types';
import type { MockHospital } from '@/lib/mockData';
import { haversineDistance } from '@/lib/mockData';
import {
  getOSRMRoute,
  formatDistance,
  formatDuration,
  DARK_TILE_URL,
  DARK_TILE_ATTRIBUTION,
} from '@/lib/maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
interface RouteInfo {
  distance: string;
  duration: string;
  durationValue: number; // seconds
  steps: string[];
  source: 'osrm' | 'fallback';
}

interface LeafletMapProps {
  userLocation: LatLng;
  hospitals: MockHospital[];
  nearestHospitalId: string | null;
  onRouteCalculated?: (info: RouteInfo) => void;
  onHospitalSelected?: (hospitalId: string) => void;
  className?: string;
}

/* ─────────────────────────────────────────────
   Custom Icons
   ───────────────────────────────────────────── */
function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    html: `
      <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
        <div class="user-marker-ring"></div>
        <div class="user-marker-ring" style="animation-delay:0.7s;"></div>
        <div class="user-marker-ring" style="animation-delay:1.4s;"></div>
        <div class="user-marker-pulse"></div>
      </div>
    `,
  });
}

function createHospitalIcon(isNearest: boolean): L.DivIcon {
  const cls = isNearest ? 'hospital-marker-nearest' : 'hospital-marker-default';
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `
      <div class="hospital-marker ${cls}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18M9 8h6M12 5v6M9 21V12h6v9"/>
        </svg>
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────
   LeafletMap Component
   ───────────────────────────────────────────── */
export function LeafletMap({
  userLocation,
  hospitals,
  nearestHospitalId,
  onRouteCalculated,
  onHospitalSelected,
  className = '',
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const drawRequestRef = useRef(0);
  const [ready, setReady] = useState(false);

  /* ── Initialize map ──────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    const darkLayer = L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    L.control
      .layers(
        {
          'Dark Grid': darkLayer,
          'Street Map': lightLayer,
        },
        {},
        { position: 'topright' },
      )
      .addTo(map);

    const trafficLayer = L.layerGroup();
    trafficLayerRef.current = trafficLayer;
    trafficLayer.addTo(map);

    const segments = [
      [[userLocation.lat - 0.01, userLocation.lng - 0.01], [userLocation.lat + 0.005, userLocation.lng + 0.01]],
      [[userLocation.lat - 0.015, userLocation.lng + 0.012], [userLocation.lat + 0.008, userLocation.lng + 0.02]],
      [[userLocation.lat - 0.02, userLocation.lng - 0.005], [userLocation.lat + 0.01, userLocation.lng - 0.02]],
    ] as Array<[[number, number], [number, number]]>;

    segments.forEach((segment, idx) => {
      L.polyline(segment, {
        color: idx % 2 === 0 ? '#f97316' : '#ef4444',
        weight: 4,
        opacity: 0.25,
        dashArray: '8 8',
      }).addTo(trafficLayer);
    });

    const LocateControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('button', 'leaflet-bar');
        container.innerHTML = 'Locate';
        container.setAttribute('type', 'button');
        container.style.background = 'rgba(6,10,19,0.9)';
        container.style.color = '#00f0ff';
        container.style.border = '1px solid rgba(0,240,255,0.2)';
        container.style.padding = '8px 10px';
        container.style.fontSize = '11px';
        container.style.cursor = 'pointer';
        L.DomEvent.on(container, 'click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          map.locate({ setView: true, maxZoom: 15 });
        });
        return container;
      },
    });

    const TrafficToggleControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('button', 'leaflet-bar');
        container.innerHTML = 'Traffic';
        container.setAttribute('type', 'button');
        container.style.background = 'rgba(6,10,19,0.9)';
        container.style.color = '#00f0ff';
        container.style.border = '1px solid rgba(0,240,255,0.2)';
        container.style.padding = '8px 10px';
        container.style.fontSize = '11px';
        container.style.cursor = 'pointer';
        L.DomEvent.on(container, 'click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          if (map.hasLayer(trafficLayer)) {
            map.removeLayer(trafficLayer);
          } else {
            map.addLayer(trafficLayer);
          }
        });
        return container;
      },
    });

    map.addControl(new LocateControl({ position: 'bottomright' }));
    map.addControl(new TrafficToggleControl({ position: 'bottomright' }));

    mapRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── User marker ─────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;padding:4px 0;">
          <p style="font-size:13px;font-weight:700;color:#00f0ff;margin:0;">📍 Your Location</p>
          <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">
            ${userLocation.lat.toFixed(6)}°N, ${userLocation.lng.toFixed(6)}°E
          </p>
        </div>`,
      );

      userMarkerRef.current = marker;
    }
  }, [userLocation, ready]);

  /* ── Hospital markers ────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    // Clear old
    hospitalMarkersRef.current.forEach((m) => map.removeLayer(m));
    hospitalMarkersRef.current = [];

    hospitals.forEach((h) => {
      const isNearest = h.id === nearestHospitalId;
      const marker = L.marker([h.location.lat, h.location.lng], {
        icon: createHospitalIcon(isNearest),
        zIndexOffset: isNearest ? 900 : 500,
      }).addTo(map);

      const erStatus = h.emergencyAvailable
        ? '<span style="color:#22c55e;font-weight:600;">✓ ER Available</span>'
        : '<span style="color:#ef4444;font-weight:600;">✗ No ER</span>';

      const specialties = h.specialties
        .map(
          (s) =>
            `<span style="display:inline-block;padding:2px 6px;margin:2px;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.2);border-radius:4px;font-size:9px;color:#00f0ff;">${s}</span>`,
        )
        .join('');

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;padding:4px 0;min-width:200px;">
          <p style="font-size:14px;font-weight:700;color:white;margin:0;">${h.name}</p>
          <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">${h.address}</p>
          <p style="font-size:11px;color:#9ca3af;margin:2px 0 0;">📞 ${h.phone}</p>
          <p style="font-size:11px;margin:6px 0 4px;">${erStatus} · ${h.beds} beds</p>
          <div style="margin-top:4px;">${specialties}</div>
        </div>`,
      );

      marker.on('click', () => {
        onHospitalSelected?.(h.id);
      });

      hospitalMarkersRef.current.push(marker);
    });
  }, [hospitals, nearestHospitalId, ready, onHospitalSelected]);

  /* ── Route via OSRM ──────────────────────── */
  const drawRoute = useCallback(
    async (map: L.Map) => {
      const requestId = ++drawRequestRef.current;
      if (!nearestHospitalId) return;
      const destinationHospital = hospitals.find((h) => h.id === nearestHospitalId);
      if (!destinationHospital) return;

      if (mapRef.current !== map) return;

      // Clear old route
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      if (ambulanceMarkerRef.current) {
        map.removeLayer(ambulanceMarkerRef.current);
        ambulanceMarkerRef.current = null;
      }

      const osrmRoute = await getOSRMRoute(userLocation, destinationHospital.location);

      // Ignore stale async responses after map re-init or newer draw request.
      if (mapRef.current !== map || requestId !== drawRequestRef.current) return;

      if (osrmRoute) {
        // OSRM returns [lng, lat], Leaflet wants [lat, lng]
        const latlngs: [number, number][] = osrmRoute.geometry.map(
          ([lng, lat]) => [lat, lng] as [number, number],
        );

        const validLatLngs = latlngs.filter(
          ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng),
        );
        if (validLatLngs.length < 2) return;

        // Animated route line
        const routeLine = L.polyline(validLatLngs, {
          color: '#00f0ff',
          weight: 4,
          opacity: 0.8,
          dashArray: '12 6',
          className: 'route-line-animated',
        }).addTo(map);

        // Glow line behind
        L.polyline(validLatLngs, {
          color: '#00f0ff',
          weight: 10,
          opacity: 0.15,
        }).addTo(map);

        routeLayerRef.current = routeLine;

        // Ambulance marker moving along route
        const firstPoint = validLatLngs[0];
        if (firstPoint) {
          const ambIcon = L.divIcon({
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            html: `<div style="width:28px;height:28px;background:rgba(0,240,255,0.15);border:2px solid #00f0ff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px rgba(0,240,255,0.3);">🚑</div>`,
          });
          const ambMarker = L.marker(firstPoint, {
            icon: ambIcon,
            zIndexOffset: 950,
          }).addTo(map);
          ambulanceMarkerRef.current = ambMarker;

          // Animate ambulance
          let idx = 0;
          const step = Math.max(1, Math.floor(validLatLngs.length / 200));
          const animateAmbulance = () => {
            if (idx < validLatLngs.length) {
              const nextPoint = validLatLngs[idx];
              if (nextPoint) {
                ambMarker.setLatLng(nextPoint);
              }
              idx += step;
              requestAnimationFrame(animateAmbulance);
            }
          };
          setTimeout(animateAmbulance, 500);
        }

        // Notify parent
        if (onRouteCalculated) {
          onRouteCalculated({
            distance: formatDistance(osrmRoute.distance),
            duration: formatDuration(osrmRoute.duration),
            durationValue: osrmRoute.duration,
            steps: osrmRoute.steps,
            source: 'osrm',
          });
        }

        // Fit map to route
        map.fitBounds(routeLine.getBounds().pad(0.15));
      } else {
        // Fallback: straight line
        const line = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [destinationHospital.location.lat, destinationHospital.location.lng],
          ],
          {
            color: '#00f0ff',
            weight: 3,
            opacity: 0.6,
            dashArray: '8 4',
          },
        ).addTo(map);
        routeLayerRef.current = line;

        if (onRouteCalculated) {
          const km = haversineDistance(userLocation, destinationHospital.location);
          onRouteCalculated({
            distance: `${km.toFixed(1)} km`,
            duration: `~${Math.ceil(km * 2.5)} min`,
            durationValue: Math.ceil(km * 2.5) * 60,
            steps: ['Proceed to the selected hospital via the main road'],
            source: 'fallback',
          });
        }
      }
    },
    [userLocation, hospitals, nearestHospitalId, onRouteCalculated],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    drawRoute(map);
  }, [ready, drawRoute]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={containerRef} className="h-full w-full" style={{ minHeight: '100%' }} />
    </div>
  );
}

export default LeafletMap;
