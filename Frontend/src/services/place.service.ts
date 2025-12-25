import api from "./api";
import type { PlaceResponse, CreatePlaceRequest,PlaceType  } from "../types/place.types.ts";

export async function getPlaces(): Promise<PlaceResponse[]> {
  const res = await api.get<PlaceResponse[]>("/places");
  return res.data;
}

export async function createPlace(
  data: CreatePlaceRequest
): Promise<PlaceResponse> {
  const res = await api.post<PlaceResponse>("/places", data);
  return res.data;
}

export async function updatePlaceType(
  placeId: number,
  type: PlaceType
): Promise<void> {
  await api.patch(`/places/${placeId}/type`, { type });
}


export async function deletePlace(placeId: number): Promise<void> {
  await api.delete(`/places/${placeId}`);
}


export async function updatePlacePosition(
  placeId: number,
  latitude: number,
  longitude: number
): Promise<void> {
  await api.patch(`/places/${placeId}/position`, {
    latitude,
    longitude,
  });
}