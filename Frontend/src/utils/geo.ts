import type { LatLngExpression } from "leaflet";

const R = 6378137;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function buildCone(
  origin: [number, number],
  target: [number, number],
  angle = 30,
  distance = 200
): LatLngExpression[] {
  const [lat1, lon1] = origin;
  const [lat2, lon2] = target;

  const bearing =
    toDeg(
      Math.atan2(
        Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2)),
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
          Math.sin(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.cos(toRad(lon2 - lon1))
      )
    ) + 360;

  const half = angle / 2;

  function point(b: number) {
    const brng = toRad(b);
    const lat =
      Math.asin(
        Math.sin(toRad(lat1)) *
          Math.cos(distance / R) +
          Math.cos(toRad(lat1)) *
            Math.sin(distance / R) *
            Math.cos(brng)
      );

    const lon =
      toRad(lon1) +
      Math.atan2(
        Math.sin(brng) *
          Math.sin(distance / R) *
          Math.cos(toRad(lat1)),
        Math.cos(distance / R) -
          Math.sin(toRad(lat1)) *
            Math.sin(lat)
      );

    return [toDeg(lat), toDeg(lon)] as LatLngExpression;
  }

  return [
    origin,
    point(bearing - half),
    point(bearing + half),
  ];
}
