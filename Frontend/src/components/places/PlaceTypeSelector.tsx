import type { PlaceType } from "../../types/place.types.ts";

interface Props {
  value: PlaceType | null;
  onChange: (type: PlaceType | null) => void;
}

export default function PlaceTypeSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Empty / None */}
      <button
        className={value === null ? "primary" : ""}
        onClick={() => onChange(null)}
      >
        📍 Empty
      </button>

      {/* Camera */}
      <button
        className={value === "Camera" ? "primary" : ""}
        onClick={() => onChange("Camera")}
      >
        📷 Camera
      </button>

      {/* Radar */}
      <button
        className={value === "Radar" ? "primary" : ""}
        onClick={() => onChange("Radar")}
      >
        📡 Radar
      </button>
    </div>
  );
}
