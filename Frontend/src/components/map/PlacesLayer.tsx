import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import type { PlaceResponse } from "../../types/place.types";

type Props = {
  places: PlaceResponse[];
  onDelete: (placeId: number) => void;
  onMove: (placeId: number, lat: number, lng: number) => void;
};

const placeIcon = new L.Icon({
  iconUrl: "/place.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function PlacesLayer({
  places,
  onDelete,
  onMove,
}: Props) {
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);

  return (
    <>
      {places.map((place) => {
        const isEditing = editingPlaceId === place.id;

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={placeIcon}
            draggable={isEditing}
            eventHandlers={{
              dragend: (e) => {
                if (!isEditing) return;

                const marker = e.target;
                const { lat, lng } = marker.getLatLng();
                onMove(place.id, lat, lng);
              },
            }}
          >
            <Popup>
              <strong>Place #{place.id}</strong>

              <div style={{ marginTop: 6 }}>
                {place.deviceType ? (
                  <span>Device: {place.deviceType}</span>
                ) : (
                  <span>Empty place</span>
                )}
              </div>


              <button
                style={{
                  marginTop: 10,
                  width: "100%",
                }}
                onClick={() =>
                  setEditingPlaceId(
                    isEditing ? null : place.id
                  )
                }
              >
                ✏️ {isEditing ? "Finish Edit" : "Edit Place"}
              </button>

              <button
                style={{
                  marginTop: 8,
                  width: "100%",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete place #${place.id}?`
                    )
                  ) {
                    onDelete(place.id);
                  }
                }}
              >
                🗑️ Delete Place
              </button>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
