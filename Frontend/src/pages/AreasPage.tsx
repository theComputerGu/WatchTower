import { useEffect, useState } from "react";
import type { Area } from "../models/Area";
import {getAreas,createArea,updateArea,deleteArea,} from "../services/area.service";
import AreaForm from "../components/areas/AreaForm";



export default function AreasPage() {

  //areas:
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  //sate of editing:
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [creating, setCreating] = useState(false);



  useEffect(() => {
    loadAreas();
  }, []);

  //loadd al the areas
  async function loadAreas() {
    setLoading(true);
    const data = await getAreas();
    setAreas(data);
    setLoading(false);
  }

  //create from area form
  async function handleCreate(data: {name: string;description?: string; polygonGeoJson: string;}) {
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
      
      {/*show add area button if:*/}
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

        {/*sendimg to areamap if we additing or not*/}
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

      {/*shows if we dont do nothing*/}
      {!creating && !editingArea && (
        <div className="areas-list">
          <div className="areas-row header">
            <div>Name</div>
            <div>Description</div>
            <div>Area Admin</div>
        </div>

           {/*shows if we dont do nothing*/}
        {areas.map(area => (
          <div className="areas-row" key={area.id}>
            <div>{area.name}</div>
            <div className="muted">{area.description}</div>
            <div>{area.areaAdminName ?? "-"}</div>

            <div className="actions-cell">
              <button className="row-btn edit" onClick={() => setEditingArea(area)}>
                ✏️ Edit
              </button>
              <button className="row-btn delete" onClick={() => handleDelete(area.id)}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      )}
    </div>
  );
}
