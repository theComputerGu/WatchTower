import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { PlaceResponse } from "../../types/place.types";

type PendingPoint = { lat: number; lng: number } | null;

type Props = {
  places: PlaceResponse[];
  pendingPoint?: PendingPoint;
};

const cameraIcon = new L.Icon({
  iconUrl: "../../../public/camera.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const radarIcon = new L.Icon({
  iconUrl: "../../../public/radar.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const pendingIcon = new L.Icon({
  iconUrl: "../../../public/vite.svg", // אייקון זמני
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function DevicesLayer({ places, pendingPoint }: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={place.type === "Camera" ? cameraIcon : radarIcon}
        >
          <Popup>
            <strong>{place.type}</strong>
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
          <Popup>Pending device</Popup>
        </Marker>
      )}
    </>
  );
}
