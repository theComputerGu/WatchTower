import { useEffect, useMemo, useState } from "react";
import { Polygon } from "react-leaflet";
import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import DevicesLayer from "../components/map/DevicesLayer";
import AreasLayer from "../components/map/AreasLayer";
import TargetsLayer from "../components/map/TargetsLayer";
import DeviceDetailsPanel from "../components/devices/DeviceDetailsPanel";
import {getDevices,assignTarget,unassignTarget,assignUsersToDevice,createDevice,deleteDevice,} from "../services/device.service";
import {getTargets,createTarget,deleteTarget,} from "../services/target.service";
import { getAreas } from "../services/area.service";
import { getPlaces } from "../services/place.service";
import type { Device } from "../models/Device";
import type { Target } from "../models/Target";
import type { Area } from "../models/Area";
import type { PlaceResponse } from "../types/place.types";
import { buildCone } from "../utils/geo";
import "./DevicesPage.css";


type PendingPoint = { lat: number; lng: number } | null;

type RightPanelMode = "DEFAULT" | "CREATE_TARGET" | "DEVICE_DETAILS";

export default function DevicesPage() {


  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedDevice, setSelectedDevice] =useState<Device | null>(null);
  const [rightPanelMode, setRightPanelMode] =useState<RightPanelMode>("DEFAULT");
  const [loading, setLoading] = useState(true);
  const [isPlacingTarget, setIsPlacingTarget] =useState(false);
  const [pendingPoint, setPendingPoint] =useState<PendingPoint>(null);
  const [targetName, setTargetName] = useState("");




  useEffect(() => {
    async function load() {
      const [
        areasData,
        placesData,
        devicesData,
        targetsData,
      ] = await Promise.all([
        getAreas(),
        getPlaces(),
        getDevices(),
        getTargets(),
      ]);

      setAreas(areasData);
      setPlaces(placesData);
      setDevices(devicesData);
      setTargets(targetsData);
      setLoading(false);
    }

    load();
  }, []);






  function handleMapClick(lat: number, lng: number) {
  if (!isPlacingTarget) return;
  setPendingPoint({ lat, lng });
  }




  function handleSelectDevice(deviceId: number) {
    const device =
      devices.find((d) => d.id === deviceId) || null;

    setSelectedDevice(device);
    setRightPanelMode("DEVICE_DETAILS");
  }




  async function handleAddDevice(
    placeId: number,
    type: "Camera" | "Radar"
  ) {
    const device = await createDevice(placeId, type);

    setDevices((prev) => [...prev, device]);
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId
          ? {
              ...p,
              deviceId: device.id,
              deviceType: device.type,
            }
          : p
      )
    );

    setSelectedDevice(device);
    setRightPanelMode("DEVICE_DETAILS");
  }






  async function handleAssignTarget(targetId: number) {
    if (!selectedDevice) return;

    const updated = await assignTarget(
      selectedDevice.id,
      targetId
    );

    setDevices((prev) =>
      prev.map((d) =>
        d.id === updated.id ? updated : d
      )
    );

    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, deviceId: updated.id }
          : t.deviceId === updated.id
          ? { ...t, deviceId: null }
          : t
      )
    );

    setSelectedDevice(updated);
  }





  //disconnect the target from the device
  async function handleUnassignTarget() {
    if (!selectedDevice) return;

    const oldTargetId = selectedDevice.targetId;
    const updated = await unassignTarget(selectedDevice.id);

    setDevices((prev) =>
      prev.map((d) =>
        d.id === updated.id ? updated : d
      )
    );

    if (oldTargetId) {
      setTargets((prev) =>
        prev.map((t) =>
          t.id === oldTargetId
            ? { ...t, deviceId: null }
            : t
        )
      );
    }

    setSelectedDevice(updated);
  }





  async function handleDeleteDevice() {
  if (!selectedDevice) return;
  const deletedDeviceId = selectedDevice.id;
  await deleteDevice(deletedDeviceId);
  setDevices((prev) =>
    prev.filter((d) => d.id !== deletedDeviceId)
  );

  setPlaces((prev) =>
    prev.map((p) =>
      p.deviceId === deletedDeviceId
        ? {
            ...p,
            deviceId: null,
            deviceType: null,
          }
        : p
    )
  );
  setSelectedDevice(null);
  setRightPanelMode("DEFAULT");
}






  async function handleChangeUsers(userIds: string[]) {
    if (!selectedDevice) return;
    await assignUsersToDevice(
      selectedDevice.id,
      userIds
    );
  }





  async function handleCreateTarget() {
   if (!pendingPoint) {
    console.warn("No pending point");
    return;
  }
  const { lat, lng } = pendingPoint;

  const areaId = areas[0]?.id;

  if (!areaId) {
    alert("No area available");
    return;
  }
  const created = await createTarget({
    name: targetName || "New Target",
    latitude: lat,
    longitude: lng,
    areaId,
  });
  setTargets((prev) => [...prev, created]);
  setIsPlacingTarget(false);
  setPendingPoint(null);
  setTargetName("");
  setRightPanelMode("DEFAULT");
}






  async function handleDeleteTarget(targetId: number) {
    await deleteTarget(targetId);

    setTargets((prev) =>
      prev.filter((t) => t.id !== targetId)
    );

    setDevices((prev) =>
      prev.map((d) =>
        d.targetId === targetId
          ? { ...d, targetId: null }
          : d
      )
    );
  }



//which targets the device can use:
const availableTargets = useMemo(() => {
  return targets.filter(
    (t) =>
      t.deviceId == null ||
      t.deviceId === selectedDevice?.id
  );
}, [targets, selectedDevice]);


//takes the cordiants of device according to place
const selectedPlace = useMemo(() => {
  if (!selectedDevice) return null;

  return places.find(
    (p) => p.deviceId === selectedDevice.id
  ) || null;
}, [selectedDevice, places]);



//ehich target is now - when i ckick on device:
  const selectedTarget = useMemo(() => {
    if (!selectedDevice) return null;

    return targets.find(
      (t) => t.id === selectedDevice.targetId
    ) || null;
  }, [selectedDevice, targets]);




//angle that device look to target:
  const fixedCone = useMemo(() => {
  if (!selectedPlace || !selectedTarget) {
    return null;
  }

  return buildCone(
    [selectedPlace.latitude, selectedPlace.longitude],
    [selectedTarget.latitude, selectedTarget.longitude]
  );
}, [selectedPlace, selectedTarget]);





  if (loading) return <div>Loading...</div>;






  return (
    <div className="devices-layout">
      <MapView onMapClick={handleMapClick}>
          <AreasLayer
            areas={areas}
            disableInteraction={isPlacingTarget}
          />

          <DevicesLayer
            places={places}
            onSelectDevice={handleSelectDevice}
            onAddDevice={handleAddDevice}
            interactive
          />

          <TargetsLayer
            targets={targets}
            selectedTargetId={selectedDevice?.targetId}
            onSelectTarget={handleAssignTarget}
            onDeleteTarget={handleDeleteTarget}
            pendingPoint={isPlacingTarget ? pendingPoint : null}
          />

          {fixedCone && (
          <Polygon
              positions={fixedCone as any}
              pathOptions={{
                color: "#22c55e",    
                fillOpacity: 0.25,
              }}
            />
          )}
      </MapView>

      <RightPanel title="Control Panel">
        {rightPanelMode === "CREATE_TARGET" && (
          <section className="panel-section">
            <h4>Create Target</h4>

            <p>Click on map to place target</p>

            <input
              value={targetName}
              onChange={(e) =>
                setTargetName(e.target.value)
              }
              placeholder="Target name"
            />

            <button
              disabled={!pendingPoint}
              onClick={handleCreateTarget}
            >
              Create
            </button>

            <button
              onClick={() => {
                setIsPlacingTarget(false);
                setPendingPoint(null);
                setRightPanelMode("DEFAULT");
              }}
            >
              Cancel
            </button>
          </section>
        )}

        {rightPanelMode === "DEVICE_DETAILS" &&
          selectedDevice && (
            <DeviceDetailsPanel
            device={selectedDevice}
            targets={availableTargets}
            onAssignTarget={handleAssignTarget}
            onUnassignTarget={handleUnassignTarget}
            onChangeUsers={handleChangeUsers}
            onDelete={handleDeleteDevice}
            onBack={() => setRightPanelMode("DEFAULT")}
          />
          )}

        {rightPanelMode === "DEFAULT" && (
          <section className="panel-section">
            <h4>Targets</h4>
            <button
              onClick={() => {
                setPendingPoint(null);
                setTargetName("");      
                setIsPlacingTarget(true);
                setRightPanelMode("CREATE_TARGET");
              }}
            >
              ➕ Add Target
            </button>

            <ul>
              {availableTargets.map((t) => (
                <li key={t.id}>
                  {t.name}
                  <button
                    onClick={() =>
                      handleDeleteTarget(t.id)
                    }
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </RightPanel>
    </div>
  );
}
