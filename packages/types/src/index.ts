export type LatLng = {
  lat: number;
  lng: number;
};

export type RouteUpdateEvent = {
  incidentId: string;
  origin: LatLng;
  destination: LatLng;
  timestamp: string;
};
