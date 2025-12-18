// src/utils/permissions.ts
import { ROLES } from "./roles";
import type { Role } from "./roles";

export const PERMISSIONS = {
  MAP: "MAP",
  PLACES: "PLACES",
  DEVICES: "DEVICES",
  USERS: "USERS",
  AREAS: "AREAS",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.USER]: [
    PERMISSIONS.MAP,
  ],

  [ROLES.AREA_ADMIN]: [
    PERMISSIONS.MAP,
    PERMISSIONS.PLACES,
    PERMISSIONS.DEVICES,
  ],

  [ROLES.GLOBAL_ADMIN]: [
    PERMISSIONS.MAP,
    PERMISSIONS.PLACES,
    PERMISSIONS.DEVICES,
    PERMISSIONS.USERS,
    PERMISSIONS.AREAS,
  ],
};
