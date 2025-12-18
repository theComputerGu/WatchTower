import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

type Props = {
  value?: string;
  onChange: (geoJson: string) => void;
  tall?: boolean;
};



export default function AreaMapPicker({ value, onChange, tall }: Props) {
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
        style={{
            height: tall ? "70vh" : "280px",
            width: "100%",
            borderRadius: "14px",
        }}
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
            polygon: !value,
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            }}
        />

        {value && <GeoJSON data={JSON.parse(value)} />}
      </FeatureGroup>
    </MapContainer>
  );
}
