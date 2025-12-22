import { useEffect, useState } from "react";

import type { Device } from "../../models/Device";
import type { Target } from "../../models/Target";
import type { User } from "../../models/User";

import { getDeviceUsers } from "../../services/device.service";

import DeviceTargetSelector from "./DeviceTargetSelector";
import DeviceUsersSelector from "./DeviceUsersSelector";

interface Props {
  device: Device;
  targets: Target[];

  onAssignTarget: (targetId: number) => Promise<void>;
  onUnassignTarget: () => Promise<void>;
  onToggleActive: (isActive: boolean) => Promise<void>;
  onChangeUsers: (userIds: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function DeviceDetailsPanel({
  device,
  targets,
  onAssignTarget,
  onUnassignTarget,
  onToggleActive,
  onChangeUsers,
  onDelete,
}: Props) {
  // ============================
  // Users state (local)
  // ============================
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ============================
  // Load users for this device
  // ============================
  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const data = await getDeviceUsers(device.id);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load device users", err);
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, [device.id]);

  return (
    <div>
      <h4>Device #{device.id}</h4>

      <p>
        <strong>Type:</strong> {device.type}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {device.isActive ? "🟢 Active" : "⚪ Inactive"}
      </p>

      {device.orientationAngle != null && (
        <p>
          <strong>Orientation:</strong>{" "}
          {device.orientationAngle.toFixed(1)}°
        </p>
      )}

      <hr />

      {/* ===== Target ===== */}
      <label>Target</label>

      <DeviceTargetSelector
        targets={targets}
        selectedTargetId={device.targetId}
        onSelect={onAssignTarget}
        onClear={onUnassignTarget}
      />

      <hr />

      {/* ===== Users ===== */}
      {loadingUsers ? (
        <p style={{ opacity: 0.6 }}>Loading users...</p>
      ) : (
        <DeviceUsersSelector
          users={users}
          selectedIds={device.userIds ?? []}
          onChange={onChangeUsers}
        />
      )}

      {/* ===== Activate / Deactivate ===== */}
      <button
        style={{
          marginTop: 12,
          width: "100%",
          background: device.isActive ? "#ef4444" : "#22c55e",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "8px",
          cursor: "pointer",
        }}
        onClick={() => onToggleActive(!device.isActive)}
      >
        {device.isActive ? "Deactivate" : "Activate"}
      </button>

      <hr />

      {/* ===== Delete ===== */}
      <button
        style={{
          marginTop: 12,
          width: "100%",
          background: "#b91c1c",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "8px",
          cursor: "pointer",
        }}
        onClick={() => {
          if (
            window.confirm(
              "Are you sure you want to delete this device?"
            )
          ) {
            onDelete();
          }
        }}
      >
        🗑️ Delete Device
      </button>
    </div>
  );
}
