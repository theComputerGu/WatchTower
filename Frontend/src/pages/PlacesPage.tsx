import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import PolygonLayer from "../components/map/PolygonLayer";
import DevicesLayer from "../components/map/DevicesLayer";

import { getAreas, getMyAreas } from "../services/area.service";
import { getPlaces, createPlace } from "../services/place.service";

import type { Area } from "../models/Area";
import type { PlaceResponse, PlaceType } from "../types/place.types";

import PlaceTypeSelector from "../components/places/PlaceTypeSelector";

type PendingPoint = { lat: number; lng: number } | null;

export default function PlacesPage() {
  // 🔹 user מגיע מ־Redux
  const user = useSelector((state: RootState) => state.auth.user);

  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [selectedType, setSelectedType] = useState<PlaceType>("Camera");
  const [loading, setLoading] = useState(true);

  const [isPlacing, setIsPlacing] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<PendingPoint>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;

      try {
        // 🔥 הבחירה לפי role
        const areasPromise =
          user.role === "AREA_ADMIN" ? getMyAreas() : getAreas();

        const [areasData, placesData] = await Promise.all([
          areasPromise,
          getPlaces(),
        ]);

        setAreas(areasData);
        setPlaces(placesData);
      } catch (err) {
        console.error("Failed to load places page data", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  function handleMapClick(lat: number, lng: number) {
    if (!isPlacing) return;
    setPendingPoint({ lat, lng });
    setStatusMsg(null);
  }

  async function handleConfirmCreate() {
    if (!pendingPoint) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const newPlace = await createPlace({
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
        type: selectedType,
      });

      setPlaces((prev) => [...prev, newPlace]);
      setPendingPoint(null);
      setIsPlacing(false);
      setStatusMsg("✅ Place created successfully");
    } catch (err: any) {
      setStatusMsg(
        err?.response?.data?.message || "❌ Failed to create place"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setPendingPoint(null);
    setIsPlacing(false);
    setStatusMsg(null);
  }

  if (loading) return <div>Loading...</div>;
console.log("AREAS:", areas);
  return (
    <div className="page">
      <MapView onMapClick={handleMapClick}>
        <PolygonLayer areas={areas} interactive={!isPlacing} />
        <DevicesLayer places={places} pendingPoint={pendingPoint} />
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
