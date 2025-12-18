import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";

type MapViewProps = {
  children?: ReactNode;
};

const CENTER: LatLngExpression = [32.0853, 34.7818];

export default function MapView({ children }: MapViewProps) {
  return (
    <div className="map">
      <MapContainer
        center={CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {children}
      </MapContainer>
    </div>
  );
}
