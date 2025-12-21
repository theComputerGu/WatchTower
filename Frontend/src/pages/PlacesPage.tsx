import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import PolygonLayer from "../components/map/PolygonLayer";
import DevicesLayer from "../components/map/DevicesLayer";

import { getAreas, getMyAreas } from "../services/area.service";
import {
  getPlaces,
  createPlace,
  updatePlaceType,
  deletePlace,
} from "../services/place.service";

import type { Area } from "../models/Area";
import type { PlaceResponse, PlaceType } from "../types/place.types";

import PlaceTypeSelector from "../components/places/PlaceTypeSelector";

type PendingPoint = { lat: number; lng: number } | null;

export default function PlacesPage() {
  // ============================
  // Auth
  // ============================
  const user = useSelector((state: RootState) => state.auth.user);

  // ============================
  // Data
  // ============================
  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [selectedType, setSelectedType] = useState<PlaceType | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // Placement state
  // ============================
  const [isPlacing, setIsPlacing] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<PendingPoint>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // ============================
  // Initial load
  // ============================
  useEffect(() => {
    async function load() {
      if (!user) return;

      try {
        const areasPromise =
          user.role === "AREA_ADMIN" ? getMyAreas() : getAreas();

        const [areasData, placesData] = await Promise.all([
          areasPromise,
          getPlaces(),
        ]);

        setAreas(areasData);
        setPlaces(placesData);
      } catch (err) {
        console.error("Failed to load places", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // ============================
  // Map click
  // ============================
  function handleMapClick(lat: number, lng: number) {
    if (!isPlacing) return;
    setPendingPoint({ lat, lng });
    setStatusMsg(null);
  }

  // ============================
  // CREATE
  // ============================
  async function handleConfirmCreate() {
    if (!pendingPoint) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const payload: any = {
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
      };

      if (selectedType) payload.type = selectedType;

      const newPlace = await createPlace(payload);

      setPlaces((prev) => [...prev, newPlace]);
      setPendingPoint(null);
      setIsPlacing(false);
      setStatusMsg("✅ Place created");
    } catch (err: any) {
      setStatusMsg(
        err?.response?.data?.message || "❌ Failed to create place"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ============================
  // EDIT
  // ============================
  async function handleEditPlaceType(
    placeId: number,
    newType: PlaceType
  ) {
    try {
      await updatePlaceType(placeId, newType);

      setPlaces((prev) =>
        prev.map((p) =>
          p.id === placeId ? { ...p, type: newType } : p
        )
      );
    } catch (err) {
      console.error("Failed to update place type", err);
      alert("Failed to update place type");
    }
  }
  // ============================
// DELETE
// ============================
async function handleDeletePlace(placeId: number) {
  try {
    await deletePlace(placeId);

    setPlaces((prev) =>
      prev.filter((p) => p.id !== placeId)
    );
  } catch (err) {
    console.error("Failed to delete place", err);
    alert("Failed to delete place");
  }
}
  // ============================
  // Cancel
  // ============================
  function handleCancel() {
    setPendingPoint(null);
    setIsPlacing(false);
    setStatusMsg(null);
  }

  if (loading) return <div>Loading...</div>;

  // ============================
  // Render
  // ============================
  return (
    <div className="page">
      <MapView onMapClick={handleMapClick}>
        <PolygonLayer areas={areas} interactive={!isPlacing} />
        <DevicesLayer
  places={places}
  pendingPoint={pendingPoint}
  onEditType={handleEditPlaceType}
  onDelete={handleDeletePlace}
/>

      </MapView>

      <RightPanel title="Add Place">
        <button
          className={isPlacing ? "primary" : ""}
          onClick={() => {
            setIsPlacing((v) => !v);
            setPendingPoint(null);
            setStatusMsg(null);
          }}
        >
          📍 {isPlacing ? "Placing device..." : "Add Device"}
        </button>

        <div style={{ marginTop: 12 }}>
          <label>Device Type</label>
          <PlaceTypeSelector
            value={selectedType}
            onChange={setSelectedType}
          />
        </div>

        {isPlacing && (
          <>
            <p style={{ marginTop: 12 }}>
              Click on the map to select a point
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="primary"
                disabled={!pendingPoint || submitting}
                onClick={handleConfirmCreate}
              >
                {submitting ? "Saving..." : "Confirm"}
              </button>

              <button onClick={handleCancel}>Cancel</button>
            </div>
          </>
        )}

        {statusMsg && <p style={{ marginTop: 12 }}>{statusMsg}</p>}
      </RightPanel>
    </div>
  );
}
