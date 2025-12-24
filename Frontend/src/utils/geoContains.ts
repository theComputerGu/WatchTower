// import type { Area } from "../models/Area";

// type LatLng = {
//   latitude: number;
//   longitude: number;
// };
 

// function isPointInPolygon(
//   lat: number,
//   lng: number,
//   polygon: LatLng[]
// ): boolean {
//   let inside = false;
//   const EPS = 1e-10;

//   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//     const xi = polygon[i].longitude;
//     const yi = polygon[i].latitude;
//     const xj = polygon[j].longitude;
//     const yj = polygon[j].latitude;

//     const intersect =
//       (yi > lat) !== (yj > lat) &&
//       lng <
//         ((xj - xi) * (lat - yi)) /
//           (yj - yi + EPS) +
//           xi;

//     if (intersect) inside = !inside;
//   }

//   return inside;
// }

// /**
//  * Parse GeoJSON Polygon / MultiPolygon
//  * Always returns an array of polygons
//  */
// function parsePolygonGeoJson(
//   polygonGeoJson: string
// ): LatLng[][] | null {
//   try {
//     const geo = JSON.parse(polygonGeoJson);

//     // ===== Polygon =====
//     if (geo.type === "Polygon") {
//       return [
//         geo.coordinates[0].map(
//           ([lng, lat]: [number, number]) => ({
//             latitude: lat,
//             longitude: lng,
//           })
//         ),
//       ];
//     }

//     // ===== MultiPolygon =====
//     if (geo.type === "MultiPolygon") {
//       return geo.coordinates.map(
//         (poly: number[][][]) =>
//           poly[0].map(([lng, lat]) => ({
//             latitude: lat,
//             longitude: lng,
//           }))
//       );
//     }

//     console.warn("Unsupported GeoJSON type:", geo.type);
//     return null;
//   } catch (err) {
//     console.error("Invalid polygonGeoJson", err);
//     return null;
//   }
// }

// /**
//  * Find area that contains the given point
//  */
// export function findAreaForPoint(
//   areas: Area[],
//   lat: number,
//   lng: number
// ): Area | null {
//   for (const area of areas) {
//     const polygons = parsePolygonGeoJson(
//       area.polygonGeoJson
//     );

//     if (!polygons) continue;

//     for (const polygon of polygons) {
//       if (isPointInPolygon(lat, lng, polygon)) {
//         return area;
//       }
//     }
//   }

//   return null;
// }
