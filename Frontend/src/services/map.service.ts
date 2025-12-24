import api from "./api";
import type { MapFilters, MapSnapshotResponse } from "../types/map.types";


//getting data for map page
export async function getMapSnapshot(
  filters: MapFilters = {}
): Promise<MapSnapshotResponse> {
  const res = await api.get<MapSnapshotResponse>("/map", {
    params: filters,
  });
  return res.data;
}
