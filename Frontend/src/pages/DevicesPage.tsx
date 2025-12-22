import { useEffect, useState } from "react";

import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import DevicesLayer from "../components/map/DevicesLayer";
import AreasLayer from "../components/map/AreasLayer";
import DeviceDetailsPanel from "../components/devices/DeviceDetailsPanel";

import {
  getDevices,
  assignTarget,
  unassignTarget,
  toggleDeviceActive,
  assignUsersToDevice,
  createDevice,
  deleteDevice, // 👈 חשוב
} from "../services/device.service";

import { getAreas } from "../services/area.service";
import { getTargets } from "../services/target.service";
import { getPlaces } from "../services/place.service";

import type { Device } from "../models/Device";
import type { Target } from "../models/Target";
import type { Area } from "../models/Area";
import type { PlaceResponse } from "../types/place.types";

export default function DevicesPage() {
  // ============================
  // State
  // ============================
  const [areas, setAreas] = useState<Area[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================
  // Initial load
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const [areasData, placesData, devicesData, targetsData] =
          await Promise.all([
            getAreas(),
            getPlaces(),
            getDevices(),
            getTargets(),
          ]);

        setAreas(areasData);
        setPlaces(placesData);
        setDevices(devicesData);
        setTargets(targetsData);
      } catch (err) {
        console.error("Failed to load devices page", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ============================
  // Select device from map
  // ============================
  function handleSelectDevice(deviceId: number) {
    const device = devices.find((d) => d.id === deviceId) || null;
    setSelectedDevice(device);
  }

  // ============================
  // Assign target
  // ============================
  async function handleAssignTarget(targetId: number) {
    if (!selectedDevice) return;

    const updated = await assignTarget(selectedDevice.id, targetId);

    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setSelectedDevice(updated);
  }

  // ============================
  // Unassign target
  // ============================
  async function handleUnassignTarget() {
    if (!selectedDevice) return;

    const updated = await unassignTarget(selectedDevice.id);

    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setSelectedDevice(updated);
  }

  // ============================
  // Toggle active
  // ============================
  async function handleToggleActive(isActive: boolean) {
    if (!selectedDevice) return;

    const updated = await toggleDeviceActive(selectedDevice.id, isActive);

    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setSelectedDevice(updated);
  }

  // ============================
  // Add device to place
  // ============================
  async function handleAddDevice(
    placeId: number,
    type: "Camera" | "Radar"
  ) {
    try {
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
    } catch (err) {
      console.error("Failed to create device", err);
      alert("Failed to add device");
    }
  }

  // ============================
  // Delete device
  // ============================
  async function handleDeleteDevice() {
    if (!selectedDevice) return;

    await deleteDevice(selectedDevice.id);

    setDevices((prev) =>
      prev.filter((d) => d.id !== selectedDevice.id)
    );

    setPlaces((prev) =>
      prev.map((p) =>
        p.deviceId === selectedDevice.id
          ? {
              ...p,
              deviceId: null,
              deviceType: null,
            }
          : p
      )
    );

    setSelectedDevice(null);
  }

  // ============================
  // Change users
  // ============================
  async function handleChangeUsers(userIds: string[]) {
    if (!selectedDevice) return;
    await assignUsersToDevice(selectedDevice.id, userIds);
  }

  if (loading) return <div>Loading...</div>;

  // ============================
  // Render
  // ============================
  return (
    <div className="page">
      {/* ===== MAP ===== */}
      <MapView>
        {/* 🟦 Areas */}
        <AreasLayer areas={areas} />

        {/* 📍 Places + Devices */}
        <DevicesLayer
          places={places}
          onSelectDevice={handleSelectDevice}
          onAddDevice={handleAddDevice}
        />
      </MapView>

      {/* ===== RIGHT PANEL ===== */}
      <RightPanel title="Device Details">
        {selectedDevice ? (
          <DeviceDetailsPanel
            device={selectedDevice}
            targets={targets}
            onAssignTarget={handleAssignTarget}
            onUnassignTarget={handleUnassignTarget}
            onToggleActive={handleToggleActive}
            onChangeUsers={handleChangeUsers}
            onDelete={handleDeleteDevice}
          />
        ) : (
          <p style={{ opacity: 0.7 }}>
            Select a device on the map
          </p>
        )}
      </RightPanel>
    </div>
  );
}
