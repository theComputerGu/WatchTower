import api from "./api";
import type { Target } from "../models/Target";

// ============================
// Get all targets
// ============================
export async function getTargets(): Promise<Target[]> {
  const res = await api.get<Target[]>("/targets");
  return res.data;
}

// ============================
// Create target (FIXED)ש
// ============================

export type CreateTargetRequest = {
  name: string;
  latitude: number;
  longitude: number;

  areaId: number;          // 🔥 חובה – לפי הבקנד
  deviceId?: number;       // אופציונלי
};

export async function createTarget(
  data: CreateTargetRequest
): Promise<Target> {
  const res = await api.post<Target>("/targets", data);
  return res.data;
}

// ============================
// Delete target
// ============================
export async function deleteTarget(
  targetId: number
): Promise<void> {
  await api.delete(`/targets/${targetId}`);
}
