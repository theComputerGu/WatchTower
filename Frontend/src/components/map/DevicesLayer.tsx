import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { PlaceResponse } from "../../types/place.types";

type PendingPoint = { lat: number; lng: number } | null;

type Props = {
  places: PlaceResponse[];
  pendingPoint?: PendingPoint;
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
  iconUrl: "/place.svg", // אייקון נקודה רגילה
  iconSize: [30, 30],
  iconAnchor: [10, 20],
});

const pendingIcon = new L.Icon({
  iconUrl: "/vite.svg", // אייקון זמני
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// =======================
// Helpers
// =======================

function getPlaceIcon(type: PlaceResponse["type"]) {
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

export default function DevicesLayer({ places, pendingPoint }: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={getPlaceIcon(place.type)}
        >
          <Popup>
            <strong>
              {place.type === "None" ? "Empty Point" : place.type}
            </strong>
            <br />
            Place #{place.id}
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
