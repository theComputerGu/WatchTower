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
      {/* HEADER */}
      <div className="areas-header centered">
        {!creating && !editingArea && (
          <button
            className="add-area-btn"
            onClick={() => setCreating(true)}
          >
            + Add Area
          </button>
        )}
      </div>

      {/* CREATE / EDIT */}
      {(creating || editingArea) && (
        <AreaForm
          initial={editingArea}
          onSave={editingArea ? handleUpdate : handleCreate}
          onCancel={() => {
            setCreating(false);
            setEditingArea(null);
          }}
        />
      )}

      {/* TABLE – מוצג רק כשלא עורכים */}
      {!creating && !editingArea && (
        <div className="areas-table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Name</th>
                <th style={{ width: "38%" }}>Description</th>
                <th style={{ width: "14%" }}>Area Admin</th>
                <th
                  style={{
                    width: "26%",
                    textAlign: "right",
                    paddingRight: "16px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id}>
                  <td>{area.name}</td>
                  <td>{area.description}</td>
                  <td>{area.areaAdminName ?? "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="row-btn edit"
                      onClick={() => setEditingArea(area)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="row-btn delete"
                      onClick={() => handleDelete(area.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
