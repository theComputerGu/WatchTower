import { useEffect, useState } from "react";

import type { Device } from "../../models/Device";
import type { Target } from "../../models/Target";
import type { User } from "../../models/User";

import { getDeviceUsers } from "../../services/device.service";

import DeviceTargetSelector from "./DeviceTargetSelector";
import DeviceUsersSelector from "./DeviceUsersSelector";

type Props = {
  device: Device;
  targets: Target[];

  onAssignTarget: (targetId: number) => void;
  onUnassignTarget: () => void;

  onChangeUsers: (userIds: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
  onBack?: () => void; // 👈 חדש
};

export default function DeviceDetailsPanel({
  device,
  targets,
  onAssignTarget,
  onUnassignTarget,
  onChangeUsers,
  onDelete,
  onBack, // 👈 זה מה שחסר
}: Props) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getDeviceUsers(device.id).then(setUsers);
  }, [device.id]);

  return (

    
    <div>
      {onBack && (
      <button
        style={{ marginBottom: 12 }}
        onClick={onBack}
      >
        ← Back
      </button>
    )}
      <h4>Device #{device.id}</h4>

      <p>
        <strong>Type:</strong> {device.type}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {device.isActive ? "🟢 Active" : "⚪ Inactive"}
      </p>

      <hr />

      <label>Target</label>
      <DeviceTargetSelector
        targets={targets}
        selectedTargetId={device.targetId}
        onSelect={onAssignTarget}
        onClear={onUnassignTarget}
      />

      <hr />

      <DeviceUsersSelector
        users={users}
        selectedIds={device.userIds ?? []}
        onChange={onChangeUsers}
      />

      <hr />

      <button
        style={{ background: "#b91c1c", color: "white" }}
        onClick={() => {
          if (
            window.confirm(
              "Delete this device?"
            )
          ) {
            onDelete();
          }
        }}
      >
        🗑 Delete Device
      </button>
    </div>
  );
}
