export type MapFilters = {
  areaId?: number;
  deviceType?: "Camera" | "Radar";
  status?: "active" | "offline";
};

export type MapAreaDto = {
  id: number;
  name: string;
  polygonGeoJson: string;
};

export type MapDeviceDto = {
  id: number;
  type: "Camera" | "Radar";
  latitude: number;
  longitude: number;
  isActive: boolean;
  areaId: number;
  targetId?: number | null;
  targetLatitude?: number | null;
  targetLongitude?: number | null;
};

export type MapTargetDto = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  areaId: number;
  deviceId?: number | null;
};

export type MapStatsDto = {
  areas: number;
  cameras: number;
  radars: number;
  active: number;
  offline: number;
};

export type MapSnapshotResponse = {
  areas: MapAreaDto[];
  devices: MapDeviceDto[];
  targets: MapTargetDto[];
  stats: MapStatsDto;
};
