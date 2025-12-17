// src/utils/roles.ts

export const ROLES = {
  USER: "USER",
  AREA_ADMIN: "AREA_ADMIN",
  GLOBAL_ADMIN: "GLOBAL_ADMIN",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
