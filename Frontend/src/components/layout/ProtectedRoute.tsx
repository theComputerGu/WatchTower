import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import type { Permission } from "../../utils/permissions";

type Props = {
  permission: Permission;
  children: ReactNode;
};

export default function ProtectedRoute({ permission, children }: Props) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <Navigate to="/map" replace />;
  }

  return <>{children}</>;
}
