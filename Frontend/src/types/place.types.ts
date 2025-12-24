export type PlaceType = "Camera" | "Radar";

export interface CreatePlaceRequest {
  latitude: number;
  longitude: number;
  type?: PlaceType | null;
}

export type PlaceResponse = {
  id: number;
  latitude: number;
  longitude: number;
  areaId: number;
  deviceId?: number | null;
  deviceType?: PlaceType | null;
  isActive: boolean;
  targetLatitude?: number | null;
  targetLongitude?: number | null;
};
