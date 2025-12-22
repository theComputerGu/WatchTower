import api from "./api";
import type { Target } from "../models/Target";

export async function getTargets(): Promise<Target[]> {
  const res = await api.get<Target[]>("/targets");
  return res.data;
}
