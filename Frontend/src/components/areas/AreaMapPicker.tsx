import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

type Props = {
  value?: string;
  onChange: (geoJson: string) => void;
};

export default function AreaMapPicker({ value, onChange }: Props) {
  function handleCreated(e: any) {
    const geoJson = e.layer.toGeoJSON();
    onChange(JSON.stringify(geoJson));
  }

  function handleEdited(e: any) {
    e.layers.eachLayer((layer: any) => {
      const geoJson = layer.toGeoJSON();
      onChange(JSON.stringify(geoJson));
    });
  }

  function handleDeleted() {
    onChange("");
  }

  return (
    <MapContainer
      center={[32.0853, 34.7818]}
      zoom={10}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: true,
          }}
        />

        {value && <GeoJSON data={JSON.parse(value)} />}
      </FeatureGroup>
    </MapContainer>
  );
}
