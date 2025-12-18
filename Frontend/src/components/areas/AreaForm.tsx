import { useState } from "react";
import type { Area } from "../../models/Area";
import AreaMapPicker from "./AreaMapPicker";

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
  const [polygon, setPolygon] = useState(
    initial?.polygonGeoJson ?? ""
  );
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      description,
      polygonGeoJson: polygon,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="area-form">
      <h3>{initial ? "Edit Area" : "Create Area"}</h3>

      <label>
        Name
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Description
        <input
          value={description ?? ""}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <label>
        Polygon (GeoJSON)
        <label>
            Area Polygon
            <AreaMapPicker
                value={polygon}
                onChange={setPolygon}
            />
        </label>
      </label>

      <div className="actions">
        <button type="submit" disabled={saving}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
