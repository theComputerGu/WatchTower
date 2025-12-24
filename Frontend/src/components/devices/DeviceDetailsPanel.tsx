
import type { Device } from "../../models/Device";
import type { Target } from "../../models/Target";
import DeviceViewersSelector from "./DeviceViewersSelector";
import DeviceTargetSelector from "./DeviceTargetSelector";

type Props = {
  device: Device;
  targets: Target[];
  onAssignTarget: (targetId: number) => void;
  onUnassignTarget: () => void;
  onChangeUsers: (userIds: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
  onBack?: () => void;
};

export default function DeviceDetailsPanel({device,targets,onAssignTarget,onUnassignTarget,onDelete,onBack,}: Props) {

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

      <hr />

      <label>Target</label>
      <DeviceTargetSelector
        targets={targets}
        selectedTargetId={device.targetId}
        onSelect={onAssignTarget}
        onClear={onUnassignTarget}
      />


      <hr />

      <h4>Viewers</h4>

      <DeviceViewersSelector deviceId={device.id} />

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

<hr />
      {onBack && (
      <button
        style={{ marginBottom: 12 }}
        onClick={onBack}
      >
        ← Back
      </button>
    )}

    </div>
  );
}
