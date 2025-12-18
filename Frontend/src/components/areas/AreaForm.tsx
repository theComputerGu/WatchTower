import { useState } from "react";
import type { Area } from "../../models/Area";
import AreaMapPicker from "./AreaMapPicker";
import "./areas.css";

type Props = {
  initial?: Area | null;
  onSave: (data: {
    name: string;
    description?: string;
    polygonGeoJson: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function AreaForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [polygon, setPolygon] = useState(initial?.polygonGeoJson ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      name,
      description,
      polygonGeoJson: polygon,
    });
    setSaving(false);
  }

  return (
    <div className="area-editor-layout">
      {/* MAP */}
      <div className="area-map-column">
        <AreaMapPicker
          value={polygon}
          onChange={setPolygon}
          tall
        />
      </div>

      {/* SIDE PANEL */}
      <div className="area-side-panel">
        <h2>{initial ? "Edit Area" : "Create Area"}</h2>
        <p className="subtitle">
          Draw the area on the map and define its details
        </p>

        <label>Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          value={description ?? ""}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />

        <div className="actions">
          <button
            disabled={!polygon || saving}
            onClick={handleSave}
          >
            Save Area
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
