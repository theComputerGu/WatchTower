import type { PlaceType } from "../../types/place.types";

interface Props {
  value: PlaceType;
  onChange: (type: PlaceType) => void;
}

export default function PlaceTypeSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className={value === "Camera" ? "primary" : ""}
        onClick={() => onChange("Camera")}
      >
        📷 Camera
      </button>

      <button
        className={value === "Radar" ? "primary" : ""}
        onClick={() => onChange("Radar")}
      >
        📡 Radar
      </button>
    </div>
  );
}
