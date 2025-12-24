import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Marker } from "react-leaflet";
import L from "leaflet";
import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import PolygonLayer from "../components/map/PolygonLayer";
import PlacesLayer from "../components/map/PlacesLayer";
import { getAreas, getMyAreas } from "../services/area.service";
import { getPlaces, createPlace, deletePlace } from "../services/place.service";
import type { Area } from "../models/Area";
import type { PlaceResponse } from "../types/place.types";


type PendingPoint = { lat: number; lng: number } | null;

//icon that presenting:
const pendingIcon = new L.Icon({
  iconUrl: "/place.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function PlacesPage() {

  //conect to the auth redux:
  const user = useSelector((state: RootState) => state.auth.user);

  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  //if using adding:
  const [isPlacing, setIsPlacing] = useState(false);

  //point that chosen in the map
  const [pendingPoint, setPendingPoint] = useState<PendingPoint>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);



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
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);


  //if adding stores the point on the map:
  function handleMapClick(lat: number, lng: number) {
    if (!isPlacing) return;
    setPendingPoint({ lat, lng });
    setStatusMsg(null);
  }


  //confirm adding place
  async function handleConfirmCreate() {
    if (!pendingPoint) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const newPlace = await createPlace({
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
      });

      setPlaces((prev) => [...prev, newPlace]);
      setPendingPoint(null);
      setIsPlacing(false);
      setStatusMsg("✅ Place created");
    } catch (err: any) {
      setStatusMsg("❌ Failed to create place");
    } finally {
      setSubmitting(false);
    }
  }



  //deleting place:
  async function handleDeletePlace(placeId: number) {
    await deletePlace(placeId);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
  }




  function handleCancel() {
    setPendingPoint(null);
    setIsPlacing(false);
    setStatusMsg(null);
  }




  if (loading) return <div>Loading...</div>;




  return (
    <div className="page">
      <MapView onMapClick={handleMapClick}>
        <PolygonLayer areas={areas} interactive={!isPlacing} />

        {/* create just if user chose a point on the map */}
        {pendingPoint && (
          <Marker
            position={[pendingPoint.lat, pendingPoint.lng]}
            icon={pendingIcon}
            opacity={0.6}
          />
        )}

        <PlacesLayer
          places={places}
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
          📍 {isPlacing ? "Placing place..." : "Add Place"}
        </button>

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
