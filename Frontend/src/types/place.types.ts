export type PlaceType = "None" | "Camera" | "Radar";

export type PlaceResponse = {
  id: number;
  latitude: number;
  longitude: number;
  type: PlaceType;
  areaId: number;
  cameraId?: number | null;
  radarId?: number | null;
};


export interface CreatePlaceRequest {
  latitude: number;
  longitude: number;
  type: PlaceType;
}
