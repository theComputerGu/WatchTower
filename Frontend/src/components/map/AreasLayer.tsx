import { Polygon, Popup } from "react-leaflet";
import type { Area } from "../../models/Area";

type Props = {
  areas: Area[];
};

export default function AreasLayer({ areas }: Props) {
  return (
    <>
      {areas.flatMap((area) => {
        let geometries: any[] = [];

        try {
          const geo = JSON.parse(area.polygonGeoJson);

          // 🔹 FeatureCollection
          if (geo.type === "FeatureCollection") {
            geometries = geo.features.map((f: any) => f.geometry);
          }

          // 🔹 Feature
          else if (geo.type === "Feature") {
            geometries = [geo.geometry];
          }

          // 🔹 Geometry directly
          else {
            geometries = [geo];
          }
        } catch {
          return [];
        }

        return geometries.flatMap((g, idx) => {
          if (g.type === "Polygon") {
            const coords = g.coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            return (
              <Polygon
                key={`${area.id}-p-${idx}`}
                positions={coords}
                pathOptions={{
                  color: "#38bdf8",
                  weight: 2,
                  fillOpacity: 0.08,
                }}
              >
                <Popup>
                  <strong>{area.name}</strong>
                </Popup>
              </Polygon>
            );
          }

          if (g.type === "MultiPolygon") {
            return g.coordinates.map(
              (poly: any, i: number) => (
                <Polygon
                  key={`${area.id}-mp-${idx}-${i}`}
                  positions={poly[0].map(
                    ([lng, lat]: [number, number]) => [lat, lng]
                  )}
                  pathOptions={{
                    color: "#38bdf8",
                    weight: 2,
                    fillOpacity: 0.08,
                  }}
                >
                  <Popup>
                    <strong>{area.name}</strong>
                  </Popup>
                </Polygon>
              )
            );
          }

          return [];
        });
      })}
    </>
  );
}
