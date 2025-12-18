import api from "./api";
import type { Area } from "../models/Area";

export async function getAreas(): Promise<Area[]> {
  const res = await api.get<Area[]>("/areas");
  return res.data;
}

export async function createArea(data: {
  name: string;
  description?: string;
  polygonGeoJson: string;
}) {
  await api.post("/areas", data);
}

export async function updateArea(
  areaId: number,
  data: {
    name: string;
    description?: string;
    polygonGeoJson: string;
  }
) {
  await api.put(`/areas/${areaId}`, data);
}

export async function deleteArea(areaId: number) {
  await api.delete(`/areas/${areaId}`);
}

export async function assignAreaAdmin(areaId: number, userId: string) {
  await api.put(`/areas/${areaId}/assign-admin/${userId}`);
}

export async function getUnassignedAreas(): Promise<Area[]> {
  const res = await api.get<Area[]>("/areas/unassigned");
  return res.data;
}
