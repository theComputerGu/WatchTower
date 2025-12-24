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



export default function MapPage() {


  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({});

  const [snapshot, setSnapshot] = useState<MapSnapshotResponse | null>(null);

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);


  //every time that the filters changed we load the map again:
  useEffect(() => {
    load();
  }, [filters]);


  //getting the data from the server:
  async function load() {
    setLoading(true);
    const data = await getMapSnapshot(filters);
    setSnapshot(data);
    setLoading(false);
  }

  //Adapter: Map devices by place response
  const places: PlaceResponse[] = useMemo(() => {
    if (!snapshot) return [];

    return snapshot.devices.map((d) => ({

      id: d.id,
      latitude: d.latitude,
      longitude: d.longitude,
      areaId: d.areaId,
      deviceId: d.id,
      deviceType: d.type, 
      isActive: d.isActive,
      targetLatitude: d.targetLatitude ?? null,
      targetLongitude: d.targetLongitude ?? null,

    })) as any;
  }, [snapshot]);


  //get Areas:
  const areas: Area[] = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.areas as any;
  }, [snapshot]);

  //get targets:
  const targets: Target[] = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.targets as any;
  }, [snapshot]);

  //in order to user the area name in the right pannel:
  const simpleAreas = useMemo(
    () => (snapshot ? snapshot.areas.map((a) => ({ id: a.id, name: a.name })) : []),
    [snapshot]
  );

  // function that remember which device was chosen
  function onSelectDevice(deviceId: number) {
    setSelectedDeviceId(deviceId);
  }


  async function onAddDevice(placeId: number, type: "Camera" | "Radar") {
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
    </div>
  );
}
