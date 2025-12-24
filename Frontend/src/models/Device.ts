export interface Device {
  id: number;
  type: "Camera" | "Radar";

  placeId: number;
  areaId: number;

  latitude: number;
  longitude: number;

  isActive: boolean;

  orientationAngle?: number | null;

  targetId?: number | null;
  targetName?: string | null;


  targetLatitude?: number | null;
  targetLongitude?: number | null;

    userIds?: string[];
}
