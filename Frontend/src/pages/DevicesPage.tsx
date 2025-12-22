import { useEffect, useMemo, useState } from "react";
import { Polygon } from "react-leaflet";

import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import DevicesLayer from "../components/map/DevicesLayer";
import AreasLayer from "../components/map/AreasLayer";
import TargetsLayer from "../components/map/TargetsLayer";
import DeviceDetailsPanel from "../components/devices/DeviceDetailsPanel";

import {
  getDevices,
  assignTarget,
  unassignTarget,
  assignUsersToDevice,
  createDevice,
  deleteDevice,
} from "../services/device.service";

import {
  getTargets,
  createTarget,
  deleteTarget,
} from "../services/target.service";

import { getAreas } from "../services/area.service";
import { getPlaces } from "../services/place.service";

import type { Device } from "../models/Device";
import type { Target } from "../models/Target";
import type { Area } from "../models/Area";
import type { PlaceResponse } from "../types/place.types";

import { buildCone } from "../utils/geo";


type PendingPoint = { lat: number; lng: number } | null;

type RightPanelMode = "DEFAULT" | "CREATE_TARGET" | "DEVICE_DETAILS";

export default function DevicesPage() {
  // ============================
  // State
  // ============================
  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);

  const [selectedDevice, setSelectedDevice] =
    useState<Device | null>(null);

  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>("DEFAULT");

  const [loading, setLoading] = useState(true);

  // ===== Target creation =====
  const [isPlacingTarget, setIsPlacingTarget] =
    useState(false);
  const [pendingPoint, setPendingPoint] =
    useState<PendingPoint>(null);
  const [targetName, setTargetName] = useState("");

  // ============================
  // Load data
  // ============================
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

  // ============================
  // Map click
  // ============================
  function handleMapClick(lat: number, lng: number) {
  if (!isPlacingTarget) return;
  setPendingPoint({ lat, lng });
}


  // ============================
  // Device actions
  // ============================
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

  // 🔥 1. הסרה מ-devices
  setDevices((prev) =>
    prev.filter((d) => d.id !== deletedDeviceId)
  );

  // 🔥 2. ניתוק מה-place (זה היה חסר!)
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

  // 🔥 3. ניקוי UI
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

  // ============================
  // Target actions
  // ============================
  async function handleCreateTarget() {
   if (!pendingPoint) {
    console.warn("No pending point");
    return;
  }


  const { lat, lng } = pendingPoint; // ✅ TypeScript רגוע מכאן והלאה

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

  // reset
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

  // ============================
  // Pending cone
  // ============================
  const pendingCone = useMemo(() => {
  if (
    rightPanelMode !== "DEVICE_DETAILS" || // 👈 חשוב
    !selectedDevice ||
    !pendingPoint
  ) {
    return null;
  }

  return buildCone(
    [selectedDevice.latitude, selectedDevice.longitude],
    [pendingPoint.lat, pendingPoint.lng]
  );
}, [rightPanelMode, selectedDevice, pendingPoint]);


const availableTargets = useMemo(() => {
  return targets.filter(
    (t) =>
      t.deviceId == null ||
      t.deviceId === selectedDevice?.id
  );
}, [targets, selectedDevice]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page">
      <MapView onMapClick={handleMapClick}>
        <AreasLayer
          areas={areas}
          disableInteraction={isPlacingTarget}
        />

        <DevicesLayer
          places={places}
          onSelectDevice={handleSelectDevice}
          onAddDevice={handleAddDevice}
        />

        <TargetsLayer
  targets={targets}
  selectedTargetId={selectedDevice?.targetId}
  onSelectTarget={handleAssignTarget}
  onDeleteTarget={handleDeleteTarget} // 👈 זה
  pendingPoint={isPlacingTarget ? pendingPoint : null} // 👈 זה הכול
/>

        {pendingCone && (
          <Polygon
            positions={pendingCone as any}
            pathOptions={{
              color: "#60a5fa",
              fillOpacity: 0.18,
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
  onBack={() => setRightPanelMode("DEFAULT")} // 👈 זהו
/>
          )}

        {rightPanelMode === "DEFAULT" && (
          <section className="panel-section">
            <h4>Targets</h4>

            <button
              onClick={() => {
                setPendingPoint(null);      // 👈 חובה
setTargetName("");          // 👈 מומלץ
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
