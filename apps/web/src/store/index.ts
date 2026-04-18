import { create } from 'zustand';
import type { LatLng } from '@resqroute/types';

// ──────────────────────────────────────────────
// App Store — single Zustand store for global state
// ──────────────────────────────────────────────

interface EmergencyState {
  isActive: boolean;
  location: LatLng | null;
  triggeredAt: string | null;
}

interface IIncident {
  _id: string;
  status?: string;
}

interface IUser {
  _id: string;
  name?: string;
}

interface HospitalSummary {
  id: string;
  name: string;
  location: LatLng;
  emergencyAvailable: boolean;
  beds: number;
}

interface AmbulanceState {
  id: string;
  location: LatLng;
  heading: number;
  updatedAt: string;
}

interface AppState {
  // ── Connection ──────────────────────────────
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // ── Emergency ───────────────────────────────
  emergency: EmergencyState;
  triggerEmergency: (location: LatLng) => void;
  clearEmergency: () => void;

  // ── Incidents ───────────────────────────────
  incidents: IIncident[];
  selectedIncidentId: string | null;
  setIncidents: (incidents: IIncident[]) => void;
  addIncident: (incident: IIncident) => void;
  updateIncident: (incident: IIncident) => void;
  selectIncident: (id: string | null) => void;

  // ── Responders ──────────────────────────────
  responders: IUser[];
  responderLocations: Map<string, LatLng>;
  setResponders: (responders: IUser[]) => void;
  updateResponderLocation: (userId: string, location: LatLng) => void;

  // ── Map ─────────────────────────────────────
  mapCenter: LatLng;
  mapZoom: number;
  liveAmbulance: AmbulanceState | null;
  hospitals: HospitalSummary[];
  setMapCenter: (center: LatLng) => void;
  setMapZoom: (zoom: number) => void;
  setLiveAmbulance: (ambulance: AmbulanceState | null) => void;
  setHospitals: (hospitals: HospitalSummary[]) => void;

  // ── UI ──────────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Connection
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // Emergency
  emergency: { isActive: false, location: null, triggeredAt: null },
  triggerEmergency: (location) =>
    set({
      emergency: {
        isActive: true,
        location,
        triggeredAt: new Date().toISOString(),
      },
    }),
  clearEmergency: () =>
    set({
      emergency: { isActive: false, location: null, triggeredAt: null },
    }),

  // Incidents
  incidents: [],
  selectedIncidentId: null,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents] })),
  updateIncident: (incident) =>
    set((state) => ({
      incidents: state.incidents.map((i) => (i._id === incident._id ? incident : i)),
    })),
  selectIncident: (id) => set({ selectedIncidentId: id }),

  // Responders
  responders: [],
  responderLocations: new Map(),
  setResponders: (responders) => set({ responders }),
  updateResponderLocation: (userId, location) =>
    set((state) => {
      const updated = new Map(state.responderLocations);
      updated.set(userId, location);
      return { responderLocations: updated };
    }),

  // Map — default center: Delhi, India
  mapCenter: { lat: 28.6139, lng: 77.2090 },
  mapZoom: 12,
  liveAmbulance: null,
  hospitals: [],
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setLiveAmbulance: (ambulance) => set({ liveAmbulance: ambulance }),
  setHospitals: (hospitals) => set({ hospitals }),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
