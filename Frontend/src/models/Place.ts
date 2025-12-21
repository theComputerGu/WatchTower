import type { PlaceType } from "../types/place.types";

export type Place = {
  id: number;
  latitude: number;
  longitude: number;
  type: PlaceType;
  areaId: number;
};
