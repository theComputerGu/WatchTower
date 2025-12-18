// components/map/DevicesLayer.tsx
import { Marker, Popup } from "react-leaflet";

export default function DevicesLayer() {
  return (
    <Marker position={[32.0853, 34.7818]}>
      <Popup>Camera 1</Popup>
    </Marker>
  );
}
