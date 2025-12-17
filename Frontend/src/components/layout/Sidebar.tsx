// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../utils/permissions";

export default function Sidebar() {
  const { hasPermission } = usePermissions();

  return (
    <aside className="sidebar">
      {/* Logo / Title */}
      <div className="sidebar__logo">
        WATCHTOWER
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {hasPermission(PERMISSIONS.MAP) && (
          <NavLink to="/map" className="sidebar__item">
            🗺 Map
          </NavLink>
        )}

        {hasPermission(PERMISSIONS.PLACES) && (
          <NavLink to="/places" className="sidebar__item">
            📍 Places
          </NavLink>
        )}

        {hasPermission(PERMISSIONS.DEVICES) && (
          <NavLink to="/devices" className="sidebar__item">
            📡 Devices
          </NavLink>
        )}

        {hasPermission(PERMISSIONS.USERS) && (
          <NavLink to="/users" className="sidebar__item">
            👤 Users
          </NavLink>
        )}

        {hasPermission(PERMISSIONS.AREAS) && (
          <NavLink to="/areas" className="sidebar__item">
            🧱 Areas
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
