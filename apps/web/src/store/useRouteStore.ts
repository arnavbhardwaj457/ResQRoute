import { create } from 'zustand';

type LatLng = {
  lat: number;
  lng: number;
};

type RouteState = {
  origin: LatLng;
  destination: LatLng;
  emergencyLocation: LatLng | null;
  emergencyTriggeredAt: string | null;
  setOrigin: (origin: LatLng) => void;
  setDestination: (destination: LatLng) => void;
  triggerEmergency: (location: LatLng) => void;
  clearEmergency: () => void;
};

export const useRouteStore = create<RouteState>((set) => ({
  origin: { lat: 28.6139, lng: 77.2090 },
  destination: { lat: 28.5672, lng: 77.21 },
  emergencyLocation: null,
  emergencyTriggeredAt: null,
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  triggerEmergency: (location) =>
    set({
      emergencyLocation: location,
      emergencyTriggeredAt: new Date().toISOString(),
      origin: location,
    }),
  clearEmergency: () =>
    set({
      emergencyLocation: null,
      emergencyTriggeredAt: null,
    }),
}));
