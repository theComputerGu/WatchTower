import api from "./api";
import type { Device } from "../models/Device";
import type { User } from "../models/User";

export async function getDevices(): Promise<Device[]> {
  const res = await api.get<Device[]>("/devices");
  return res.data;
}

export async function assignTarget(
  deviceId: number,
  targetId: number
): Promise<Device> {
  const res = await api.post<Device>(
    `/devices/${deviceId}/target`,
    { targetId }
  );
  return res.data;
}

export async function unassignTarget(
  deviceId: number
): Promise<Device> {
  const res = await api.delete<Device>(
    `/devices/${deviceId}/target`
  );
  return res.data;
}


export async function toggleDeviceActive(
  deviceId: number,
  isActive: boolean
): Promise<Device> {
  const res = await api.patch<Device>(
    `/devices/${deviceId}/active`,
    { isActive }
  );
  return res.data;
}


export async function assignUsers(
  deviceId: number,
  userIds: string[]
) {
  await api.post(`/devices/${deviceId}/users`, {
    userIds,
  });
}


export async function assignUsersToDevice(
  deviceId: number,
  userIds: string[]
): Promise<Device> {
  const res = await api.post<Device>(
    `/devices/${deviceId}/users`,
    { userIds }
  );
  return res.data;
}




export async function createDevice(
  placeId: number,
  type: "Camera" | "Radar"
): Promise<Device> {
  const res = await api.post<Device>("/devices", {
    placeId,
    type,
  });

  return res.data;
}


export async function deleteDevice(deviceId: number): Promise<void> {
  await api.delete(`/devices/${deviceId}`);
}



export async function removeDeviceUser(
  deviceId: number,
  userId: string
): Promise<void> {
  await api.delete(`/devices/${deviceId}/users/${userId}`);
}

export async function getDeviceUsers(
  deviceId: number
): Promise<User[]> {
  const res = await api.get<User[]>(
    `/devices/${deviceId}/users`
  );
  return res.data;
}

export async function assignDeviceUsers(
  deviceId: number,
  userIds: string[]
): Promise<void> {
  await api.post(`/devices/${deviceId}/users`, {
    userIds,
  });
}