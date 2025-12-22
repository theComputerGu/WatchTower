export type PlaceResponse = {
  id: number;
  latitude: number;
  longitude: number;
  areaId: number;

  deviceId?: number | null;
  deviceType?: "Camera" | "Radar" | null;

  isActive: boolean;

  targetLatitude?: number | null;
  targetLongitude?: number | null;
};
