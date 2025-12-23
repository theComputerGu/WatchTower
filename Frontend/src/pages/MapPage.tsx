import { useEffect, useMemo, useState } from "react";
import "../assets/styles/mapPage.css";

import MapView from "../components/map/MapView";
import AreasLayer from "../components/map/AreasLayer";
import DevicesLayer from "../components/map/DevicesLayer";
import TargetsLayer from "../components/map/TargetsLayer";
import MapRightPanel from "../components/map/MapRightPanel";

import { getMapSnapshot } from "../services/map.service";
import type { MapFilters, MapSnapshotResponse } from "../types/map.types";
import type { Area } from "../models/Area";
import type { Target } from "../models/Target";
import type { PlaceResponse } from "../types/place.types";

// אם יש לך DeviceDetailsPanel במפה - תוכל לחבר כאן
// import DeviceDetailsPanel from "../components/devices/DeviceDetailsPanel";
// import { createDevice } from "../services/device.service";

export default function MapPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({});

  const [snapshot, setSnapshot] = useState<MapSnapshotResponse | null>(null);

  // UI states
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function load() {
    setLoading(true);
    const data = await getMapSnapshot(filters);
    setSnapshot(data);
    setLoading(false);
  }

  // ============ Adapter: Map devices -> PlaceResponse ============
  const places: PlaceResponse[] = useMemo(() => {
    if (!snapshot) return [];

    return snapshot.devices.map((d) => ({
      // PlaceResponse shape (מה שיש אצלך ב-DevicesLayer)
      id: d.id, // "virtual place id" - מספיק למפה
      latitude: d.latitude,
      longitude: d.longitude,
      areaId: d.areaId,

      deviceId: d.id,
      deviceType: d.type, // "Camera" | "Radar"
      isActive: d.isActive,

      // Cone needs target lat/lng
      targetLatitude: d.targetLatitude ?? null,
      targetLongitude: d.targetLongitude ?? null,
    })) as any;
  }, [snapshot]);

  // ============ Areas / Targets typed ============
  const areas: Area[] = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.areas as any;
  }, [snapshot]);

  const targets: Target[] = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.targets as any;
  }, [snapshot]);

  const simpleAreas = useMemo(
    () => (snapshot ? snapshot.areas.map((a) => ({ id: a.id, name: a.name })) : []),
    [snapshot]
  );

  // ============ Events ============
  function onSelectDevice(deviceId: number) {
    setSelectedDeviceId(deviceId);
  }

  async function onAddDevice(placeId: number, type: "Camera" | "Radar") {
    // אם כבר יש לך זרימה להוספה דרך Places/Devices pages – תחבר פה.
    // לדוגמה, אם createDevice דורש placeId+type:
    // await createDevice({ placeId, type });
    // await load();

    console.log("Add device at virtual place", placeId, type);
  }

  return (
    <div className="map-layout">
      <div className="map-canvas">
        <MapView>
          {!loading && (
            <>
              <AreasLayer areas={areas} />
              <DevicesLayer
                places={places}
                onSelectDevice={onSelectDevice}
                onAddDevice={onAddDevice}
              />
              <TargetsLayer targets={targets} />
            </>
          )}
        </MapView>
      </div>

      <MapRightPanel
        stats={snapshot?.stats}
        filters={filters}
        onChangeFilters={setFilters}
        areas={simpleAreas}
      />

      {/* אם יש לך DeviceDetailsPanel:
          {selectedDeviceId && (
            <DeviceDetailsPanel
              deviceId={selectedDeviceId}
              onClose={() => setSelectedDeviceId(null)}
            />
          )}
      */}
    </div>
  );
}
