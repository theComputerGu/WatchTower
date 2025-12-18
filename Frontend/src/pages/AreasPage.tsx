import { useEffect, useState } from "react";
import type { Area } from "../models/Area";
import {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
} from "../services/area.service";
import AreaForm from "../components/areas/AreaForm";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  async function loadAreas() {
    setLoading(true);
    const data = await getAreas();
    setAreas(data);
    setLoading(false);
  }

  async function handleCreate(data: {
    name: string;
    description?: string;
    polygonGeoJson: string;
  }) {
    await createArea(data);
    setCreating(false);
    await loadAreas();
  }

  async function handleUpdate(data: {
    name: string;
    description?: string;
    polygonGeoJson: string;
  }) {
    if (!editingArea) return;
    await updateArea(editingArea.id, data);
    setEditingArea(null);
    await loadAreas();
  }

  async function handleDelete(areaId: number) {
    if (!confirm("Delete this area?")) return;
    await deleteArea(areaId);
    await loadAreas();
  }

  if (loading) return <div>Loading areas...</div>;

  return (
    <div className="areas-page">
      <h1>Areas</h1>

      {!creating && !editingArea && (
        <button onClick={() => setCreating(true)}>
          Create Area
        </button>
      )}

      {creating && (
        <AreaForm
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {editingArea && (
        <AreaForm
          initial={editingArea}
          onSave={handleUpdate}
          onCancel={() => setEditingArea(null)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Area Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {areas.map(area => (
            <tr key={area.id}>
              <td>{area.name}</td>
              <td>{area.description}</td>
              <td>{area.areaAdminName ?? "-"}</td>
              <td>
                <button onClick={() => setEditingArea(area)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(area.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
