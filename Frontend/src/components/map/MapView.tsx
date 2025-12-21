import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";

type MapViewProps = {
  children?: ReactNode;
  onMapClick?: (lat: number, lng: number) => void;
};

const CENTER: LatLngExpression = [32.0853, 34.7818];

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!onMapClick) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function MapView({ children, onMapClick }: MapViewProps) {
  return (
    <div className="map">
      <MapContainer
        center={CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapClickHandler onMapClick={onMapClick} />

        {children}
      </MapContainer>
    </div>
  );
}
