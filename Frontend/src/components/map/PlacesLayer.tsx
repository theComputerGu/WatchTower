import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { PlaceResponse } from "../../types/place.types";


type Props = {
  places: PlaceResponse[];
  onDelete: (placeId: number) => void;
};

const placeIcon = new L.Icon({
  iconUrl: "/place.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});



export default function PlacesLayer({
  places,
  onDelete,
}: Props) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={placeIcon}
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
      ))}
    </>
  );
}
