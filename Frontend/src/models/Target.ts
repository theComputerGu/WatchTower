export interface Target {
  id: number;

  name: string;
  description?: string;

  latitude: number;
  longitude: number;

  areaId: number;           // 🔥 חובה
  deviceId?: number | null; // אופציונלי
}
