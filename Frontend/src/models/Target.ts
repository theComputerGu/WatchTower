export interface Target {
  id: number;
  name: string;
  description?: string;

  latitude: number;
  longitude: number;

  areaId: number;

  deviceId?: number | null;
}
