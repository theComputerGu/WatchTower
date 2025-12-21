import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

import type { PlaceResponse, PlaceType } from "../../types/place.types";
import PlaceTypeSelector from "../places/PlaceTypeSelector";

type PendingPoint = { lat: number; lng: number } | null;

type Props = {
  places: PlaceResponse[];
  pendingPoint?: PendingPoint;
  onEditType: (placeId: number, type: PlaceType) => void;
};

// =======================
// Icons
// =======================

const cameraIcon = new L.Icon({
  iconUrl: "/camera.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const radarIcon = new L.Icon({
  iconUrl: "/radar.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const emptyPointIcon = new L.Icon({
  iconUrl: "/place.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const pendingIcon = new L.Icon({
  iconUrl: "/vite.svg",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// =======================
// Helpers
// =======================

function getPlaceIcon(type: PlaceType) {
  switch (type) {
    case "Camera":
      return cameraIcon;
    case "Radar":
      return radarIcon;
    case "None":
    default:
      return emptyPointIcon;
  }
}

// =======================
// Component
// =======================

export default function DevicesLayer({
  places,
  pendingPoint,
  onEditType,
}: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={getPlaceIcon(place.type)}
        >
          <Popup>
            <strong>Place #{place.id}</strong>

            <div style={{ marginTop: 8 }}>
              <PlaceTypeSelector
                value={place.type === "None" ? null : place.type}
                onChange={(newType) =>
                  onEditType(place.id, newType ?? "None")
                }
              />
            </div>
          </Popup>
        </Marker>
      ))}

      {pendingPoint && (
        <Marker
          position={[pendingPoint.lat, pendingPoint.lng]}
          icon={pendingIcon}
        >
          <Popup>Pending point</Popup>
        </Marker>
      )}
    </>
  );
}
