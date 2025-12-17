import useAppSelector from "./useAppSelector";
import { ROLE_PERMISSIONS } from "../utils/permissions";
import type { Permission } from "../utils/permissions";
import type { Role } from "../utils/roles";

export function usePermissions() {
  const role = useAppSelector(
    state => state.auth.user?.role as Role | undefined
  );

  function hasPermission(permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
  }

  return { hasPermission };
}
