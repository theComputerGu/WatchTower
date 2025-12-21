import api from "./api";
import type { PlaceResponse, CreatePlaceRequest } from "../types/place.types";

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
