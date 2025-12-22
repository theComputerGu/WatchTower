import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Target } from "../../models/Target";

type PendingPoint = { lat: number; lng: number } | null;

type Props = {
  targets: Target[];
  selectedTargetId?: number | null;

  /**
   * If provided → clicking an unlocked target assigns it
   * If undefined → display only
   */
  onSelectTarget?: (targetId: number) => void;

  /**
   * Temporary target marker while placing
   */
  pendingPoint?: PendingPoint;
};

// =======================
// Icons
// =======================

const targetIcon = new L.Icon({
  iconUrl: "/target.svg",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const selectedTargetIcon = new L.Icon({
  iconUrl: "/vite.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const lockedTargetIcon = new L.Icon({
  iconUrl: "/target.svg", // replace if you have a locked icon
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const pendingTargetIcon = new L.Icon({
  iconUrl: "/vite.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// =======================
// Component
// =======================

export default function TargetsLayer({
  targets,
  selectedTargetId,
  onSelectTarget,
  pendingPoint,
}: Props) {
  return (
    <>
      {/* ===== Existing targets ===== */}
      {targets.map((target) => {
        const isSelected = target.id === selectedTargetId;
        const isLocked = !!target.deviceId && !isSelected;

        return (
          <Marker
            key={target.id}
            position={[target.latitude, target.longitude]}
            icon={
              isSelected
                ? selectedTargetIcon
                : isLocked
                ? lockedTargetIcon
                : targetIcon
            }
            eventHandlers={{
              click: () => {
                // Read-only mode
                if (!onSelectTarget) return;

                // Locked target (belongs to another device)
                if (isLocked) return;

                onSelectTarget(target.id);
              },
            }}
          >
            <Popup>
              <strong>{target.name}</strong>

              <div style={{ marginTop: 6 }}>
                {isSelected && "🎯 Assigned to this device"}
                {!isSelected && isLocked && "🔒 Assigned to another device"}
                {!isSelected && !isLocked && onSelectTarget && "Click to assign"}
                {!onSelectTarget && "Target"}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ===== Pending target marker ===== */}
      {pendingPoint && (
        <Marker
          position={[pendingPoint.lat, pendingPoint.lng]}
          icon={pendingTargetIcon}
          interactive={false} // 👈 important: don't block map clicks
        >
          <Popup>Pending target</Popup>
        </Marker>
      )}
    </>
  );
}
