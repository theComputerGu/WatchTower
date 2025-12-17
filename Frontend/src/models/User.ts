import type { Role } from "../utils/roles";

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  areas?: string[];
}