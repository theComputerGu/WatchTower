import { Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";

import type { PlaceResponse } from "../../types/place.types";
import { buildCone } from "../../utils/geo";

type Props = {
  places: PlaceResponse[];
  onSelectDevice: (deviceId: number) => void;
  onAddDevice: (
    placeId: number,
    type: "Camera" | "Radar"
  ) => void;
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

function getPlaceIcon(deviceType?: "Camera" | "Radar" | null) {
  if (deviceType === "Camera") return cameraIcon;
  if (deviceType === "Radar") return radarIcon;
  return emptyPointIcon;
}

export default function DevicesLayer({
  places,
  onSelectDevice,
  onAddDevice,
}: Props) {
  return (
    <>
      {/* ===== MARKERS ===== */}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={getPlaceIcon(place.deviceType)}
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

            {!place.deviceId && (
              <>
                <button
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() =>
                    onAddDevice(place.id, "Camera")
                  }
                >
                  ➕ Add Camera
                </button>

                <button
                  style={{ marginTop: 6, width: "100%" }}
                  onClick={() =>
                    onAddDevice(place.id, "Radar")
                  }
                >
                  ➕ Add Radar
                </button>
              </>
            )}

            {place.deviceId && (
              <button
                style={{ marginTop: 10, width: "100%" }}
                onClick={() =>
                  onSelectDevice(place.deviceId!)
                }
              >
                ⚙️ Open Device
              </button>
            )}
          </Popup>
        </Marker>
      ))}

      {/* ===== CONES ===== */}
      {places.map((place) => {
        if (
          !place.deviceId ||
          !place.isActive ||
          !place.targetLatitude ||
          !place.targetLongitude
        ) {
          return null;
        }

        return (
          <Polygon
            key={`cone-${place.deviceId}`}
            positions={buildCone(
              [place.latitude, place.longitude],
              [place.targetLatitude, place.targetLongitude]
            )}
            pathOptions={{
              color:
                place.deviceType === "Camera"
                  ? "#f59e0b"
                  : "#22c55e",
              fillOpacity: 0.25,
              weight: 1,
            }}
          />
        );
      })}
    </>
  );
}
