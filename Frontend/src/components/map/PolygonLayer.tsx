import { Polygon, Popup } from "react-leaflet";
import type { Area } from "../../models/Area";
import type { LeafletMouseEvent } from "leaflet";

// GeoJSON → Leaflet LatLng[]
function geoJsonToLatLngs(geoJson: string): [number, number][] {
  const parsed = JSON.parse(geoJson);
  const coordinates = parsed.geometry.coordinates[0];

  return coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );
}

type Props = {
  areas: Area[];
  interactive?: boolean; // 👈 חדש
};

const DEFAULT_STYLE = {
  color: "#2563eb",
  weight: 2,
  fillColor: "#60a5fa",
  fillOpacity: 0.25,
};

const HOVER_STYLE = {
  color: "#1d4ed8",
  weight: 3,
  fillColor: "#3b82f6",
  fillOpacity: 0.45,
};

export default function PolygonLayer({
  areas,
  interactive = true,
}: Props) {
  function onMouseOver(e: LeafletMouseEvent) {
    e.target.setStyle(HOVER_STYLE);
  }

  function onMouseOut(e: LeafletMouseEvent) {
    e.target.setStyle(DEFAULT_STYLE);
  }

  return (
    <>
      {areas.map((area) => {
        const positions = geoJsonToLatLngs(area.polygonGeoJson);

        return (
          <Polygon
            key={area.id}
            positions={positions}
            pathOptions={DEFAULT_STYLE}
            interactive={interactive}
            eventHandlers={
              interactive
                ? {
                    mouseover: onMouseOver,
                    mouseout: onMouseOut,
                  }
                : undefined
            }
          >
            {interactive && (
              <Popup>
                <strong>{area.name}</strong>
              </Popup>
            )}
          </Polygon>
        );
      })}
    </>
  );
}
