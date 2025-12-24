import { Polygon, Popup } from "react-leaflet";
import type { Area } from "../../models/Area";

type Props = {
  areas: Area[];
  //for popup
  disableInteraction?: boolean;
};

export default function AreasLayer({
  areas,
  disableInteraction = false,
}: Props) {
  return (
    <>
      {areas.flatMap((area) => {

        //store the geometry object
        let geometries: any[] = [];

        try {
          //turning y db string to JSON object
          const geo = JSON.parse(area.polygonGeoJson);

          // the geo object can come with plenty types
          if (geo.type === "FeatureCollection") {
            //go over objects and thaking just the fwatures
            geometries = geo.features.map((f: any) => f.geometry);
          } else if (geo.type === "Feature") {
            geometries = [geo.geometry];
          } else {
            geometries = [geo];
          }
        } catch {
          return [];
        }

       
        return geometries.flatMap((g, idx) => {
          
          //if its just polygon
          if (g.type === "Polygon") {
            //saving it reverse
            const coords = g.coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            return (
              <Polygon
                key={`${area.id}-polygon-${idx}`}
                positions={coords}
                interactive={!disableInteraction}
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

          //iterations on each polygon:
          if (g.type === "MultiPolygon") {
            return g.coordinates.map(
              (poly: any, i: number) => (
                <Polygon
                  key={`${area.id}-multipolygon-${idx}-${i}`}
                  positions={poly[0].map(
                    ([lng, lat]: [number, number]) => [lat, lng]
                  )}
                  interactive={!disableInteraction}
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
