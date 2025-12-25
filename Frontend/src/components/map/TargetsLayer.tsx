import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Target } from "../../models/Target";

type PendingPoint = { lat: number; lng: number } | null;

type Props = {
  targets: Target[];
  selectedTargetId?: number | null;
  onSelectTarget?: (targetId: number) => void;
  onDeleteTarget?: (targetId: number) => void;
  pendingPoint?: PendingPoint;
  editingTargetId?: number | null;
  onMoveTarget?: (id: number, lat: number, lng: number) => void;
};



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
  iconUrl: "/target.svg",
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const pendingTargetIcon = new L.Icon({
  iconUrl: "/vite.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});



export default function TargetsLayer({
  targets,
  selectedTargetId,
  onSelectTarget,
  pendingPoint,
  editingTargetId,
  onMoveTarget,
}: Props) {
  return (
    <>
      {/*Existing targets*/}
      {targets.map((target) => {
        const isSelected = target.id === selectedTargetId;
        const isLocked = !!target.deviceId && !isSelected;
        const isEditing = editingTargetId === target.id;
        

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
            draggable={isEditing}
            eventHandlers={{
              dblclick: () => {
                if (onSelectTarget && !isLocked) {
                  onSelectTarget(target.id);
                }
              },
              dragend: (e) => {
                if (!isEditing || !onMoveTarget) return;

                const { lat, lng } = e.target.getLatLng();
                onMoveTarget(target.id, lat, lng);
              },
            }}
          >
            <Popup>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 140,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {target.name}
                </div>

              </div>
            </Popup>
          </Marker>
        );
      })}

      {/*Pending target marker*/}
      {pendingPoint && (
        <Marker
          position={[pendingPoint.lat, pendingPoint.lng]}
          icon={pendingTargetIcon}
          interactive={false}
        />
      )}
    </>
  );
}
