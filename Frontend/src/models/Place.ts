export interface Place {
  id: number;
  latitude: number;
  longitude: number;
  areaId: number;
  deviceId?: number | null;
  deviceType?: "Camera" | "Radar" | null;
}
