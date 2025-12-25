import api from "./api";
import type { Target } from "../models/Target";


export async function getTargets(): Promise<Target[]> {
  const res = await api.get<Target[]>("/targets");
  return res.data;
}

export type CreateTargetRequest = {
  name: string;
  latitude: number;
  longitude: number;
  areaId: number;       
  deviceId?: number;      
};

export async function createTarget(
  data: CreateTargetRequest
): Promise<Target> {
  const res = await api.post<Target>("/targets", data);
  return res.data;
}


export async function deleteTarget(
  targetId: number
): Promise<void> {
  await api.delete(`/targets/${targetId}`);
}



export async function updateTargetDetails(
  targetId: number,
  data: { name: string; description?: string }
): Promise<Target> {
  const res = await api.patch(`/targets/${targetId}`, data);
  return res.data;
}

export async function updateTargetPosition(
  targetId: number,
  latitude: number,
  longitude: number
): Promise<void> {
  await api.patch(`/targets/${targetId}/position`, {
    latitude,
    longitude,
  });
}
