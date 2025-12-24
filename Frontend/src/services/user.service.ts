import api from "./api";
import type { User } from "../models/User";

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/users");
  return res.data;
}

export async function updateUser(
  userId: string,
  data: { role: string; areaId?: number | null }
) {
  const payload: any = {
    role: data.role,
  };

  if (data.areaId !== undefined) {
    payload.areaId = data.areaId;
  }

  await api.put(`/users/${userId}`, payload);
}


export async function getMyUsers() {
  const res = await api.get("/users/my");
  return res.data;
}
