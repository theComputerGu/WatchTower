export type PlaceType = "Camera" | "Radar";

export interface PlaceResponse {
  id: number;
  latitude: number;
  longitude: number;
  type: PlaceType;
  areaId: number;
  cameraId?: number | null;
  radarId?: number | null;
}

export interface CreatePlaceRequest {
  latitude: number;
  longitude: number;
  type: PlaceType;
}
