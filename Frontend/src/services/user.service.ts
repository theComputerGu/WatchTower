// src/services/user.service.ts
import api from "./api";
import type { User } from "../models/User";

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/users");
  return res.data;
}

export async function updateUser(
  userId: string,
  data: { role: string; areaId?: number }
) {
  const payload: any = {
    role: data.role,
  };

  // שולחים areaId רק אם קיים
  if (data.areaId !== undefined) {
    payload.areaId = data.areaId;
  }

  await api.put(`/users/${userId}`, payload);
}
