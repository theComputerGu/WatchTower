export interface Place {
  id: number;
  latitude: number;
  longitude: number;
  areaId: number;

  // Device (אם קיים)
  deviceId?: number | null;
  deviceType?: "Camera" | "Radar" | null;
}
