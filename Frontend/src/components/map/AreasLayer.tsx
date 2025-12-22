import { Polygon, Popup } from "react-leaflet";
import type { Area } from "../../models/Area";

type Props = {
  areas: Area[];
  /**
   * When true:
   * - Polygons are NOT interactive
   * - Clicks pass through to the map (used for Target placing)
   */
  disableInteraction?: boolean;
};

export default function AreasLayer({
  areas,
  disableInteraction = false,
}: Props) {
  return (
    <>
      {areas.flatMap((area) => {
        let geometries: any[] = [];

        try {
          const geo = JSON.parse(area.polygonGeoJson);

          // =========================
          // Normalize GeoJSON
          // =========================
          if (geo.type === "FeatureCollection") {
            geometries = geo.features.map((f: any) => f.geometry);
          } else if (geo.type === "Feature") {
            geometries = [geo.geometry];
          } else {
            geometries = [geo];
          }
        } catch {
          // Invalid GeoJSON → skip this area
          return [];
        }

        // =========================
        // Render geometries
        // =========================
        return geometries.flatMap((g, idx) => {
          // ---------- Polygon ----------
          if (g.type === "Polygon") {
            const coords = g.coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            return (
              <Polygon
                key={`${area.id}-polygon-${idx}`}
                positions={coords}
                interactive={!disableInteraction} // 🔥 critical
                pathOptions={{
                  color: "#38bdf8",
                  weight: 2,
                  fillOpacity: 0.08,
                }}
              >
                {!disableInteraction && (
                  <Popup>
                    <strong>{area.name}</strong>
                  </Popup>
                )}
              </Polygon>
            );
          }

          // ---------- MultiPolygon ----------
          if (g.type === "MultiPolygon") {
            return g.coordinates.map(
              (poly: any, i: number) => (
                <Polygon
                  key={`${area.id}-multipolygon-${idx}-${i}`}
                  positions={poly[0].map(
                    ([lng, lat]: [number, number]) => [lat, lng]
                  )}
                  interactive={!disableInteraction} // 🔥 critical
                  pathOptions={{
                    color: "#38bdf8",
                    weight: 2,
                    fillOpacity: 0.08,
                  }}
                >
                  {!disableInteraction && (
                    <Popup>
                      <strong>{area.name}</strong>
                    </Popup>
                  )}
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
