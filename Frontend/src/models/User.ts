import type { Role } from "../utils/roles";

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  areaId?: number;
  areaName?: string;
  isActive: boolean;
}
