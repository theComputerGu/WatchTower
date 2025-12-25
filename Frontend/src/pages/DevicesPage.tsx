import { useEffect, useMemo, useState } from "react";
import { Polygon } from "react-leaflet";
import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import DevicesLayer from "../components/map/DevicesLayer";
import AreasLayer from "../components/map/AreasLayer";
import TargetsLayer from "../components/map/TargetsLayer";
import DeviceDetailsPanel from "../components/devices/DeviceDetailsPanel";
import {getDevices,assignTarget,unassignTarget,assignUsersToDevice,createDevice,deleteDevice,} from "../services/device.service";
import {getTargets,createTarget,deleteTarget,updateTargetPosition,updateTargetDetails,} from "../services/target.service";
import { getAreas } from "../services/area.service";
import { getPlaces } from "../services/place.service";
import type { Device } from "../models/Device";
import type { Target } from "../models/Target";
import type { Area } from "../models/Area";
import type { PlaceResponse } from "../types/place.types";
import { buildCone } from "../utils/geo";
import "./DevicesPage.css";
import { useRef } from "react";
import { updateDeviceType } from "../services/device.service";

type PendingPoint = { lat: number; lng: number } | null;

type RightPanelMode = "DEFAULT" | "CREATE_TARGET" | "DEVICE_DETAILS" | "EDIT_TARGET";

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

  const [editingTarget, setEditingTarget] =useState<Target | null>(null);
  const [isEditingTargetPosition, setIsEditingTargetPosition] =useState(false);
  const [editTargetName, setEditTargetName] = useState("");
  const [editTargetDescription, setEditTargetDescription] =useState("");

  const prevTargetPositions = useRef<Record<number, { lat: number; lng: number }>>({});

  const [statusMsg, setStatusMsg] = useState<string | null>(null);




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



  //update the device type:
  async function handleSwitchDeviceType(deviceId: number,newType: "Camera" | "Radar") {
  const updated = await updateDeviceType(deviceId, newType);

  setDevices((prev) =>
    prev.map((d) =>
      d.id === updated.id ? updated : d
    )
  );

  setPlaces((prev) =>
    prev.map((p) =>
      p.deviceId === updated.id
        ? { ...p, deviceType: updated.type }
        : p
    )
  );

  setSelectedDevice(updated);
}







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
  if (!pendingPoint) return;

  try {
    const created = await createTarget({
      name: targetName || "New Target",
      latitude: pendingPoint.lat,
      longitude: pendingPoint.lng,
      areaId: areas[0].id,
    });

    setTargets((prev) => [...prev, created]);
    setStatusMsg("✅ Target created");

    setIsPlacingTarget(false);
    setPendingPoint(null);
    setTargetName("");
    setRightPanelMode("DEFAULT");
  } catch {
    setStatusMsg("❌ Cannot create target in this area");
  }
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




//handles edit target:
function handleEditTarget(target: Target) {
  setEditingTarget(target);
  setEditTargetName(target.name);
  setEditTargetDescription(target.description || "");
  prevTargetPositions.current[target.id] = {
  lat: target.latitude,
  lng: target.longitude,
  };
  setRightPanelMode("EDIT_TARGET");
}



//handles edit target:
async function handleMoveTarget(
  targetId: number,
  lat: number,
  lng: number
) {
  const current = targets.find(t => t.id === targetId);
  if (!current) return;

  prevTargetPositions.current[targetId] = {
    lat: current.latitude,
    lng: current.longitude,
  };

  try {
    await updateTargetPosition(targetId, lat, lng);

    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, latitude: lat, longitude: lng }
          : t
      )
    );

    setStatusMsg("✅ Target moved");
    setIsEditingTargetPosition(false);
  } catch (err) {
    const prevPos = prevTargetPositions.current[targetId];

    if (prevPos) {
      setTargets((prevList) =>
        prevList.map((t) =>
          t.id === targetId
            ? {
                ...t,
                latitude: prevPos.lat,
                longitude: prevPos.lng,
              }
            : t
        )
      );
    }

    setStatusMsg("❌ You cannot move target to this area");
    setIsEditingTargetPosition(false);
  }
}





//handle description + name
async function handleSaveTargetDetails() {
  if (!editingTarget) return;

  try {
    const updated = await updateTargetDetails(
      editingTarget.id,
      {
        name: editTargetName,
        description: editTargetDescription,
      }
    );

    setTargets((prev) =>
      prev.map((t) =>
        t.id === updated.id ? updated : t
      )
    );

    setStatusMsg("✅ Target saved");

    setEditingTarget(null);
    setIsEditingTargetPosition(false);
    setRightPanelMode("DEFAULT");
  } catch (err) {
    setStatusMsg("❌ Failed to save target");
  }
}



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
            onSwitchDeviceType={handleSwitchDeviceType}
            interactive
          />

          <TargetsLayer
            targets={targets}
            selectedTargetId={selectedDevice?.targetId}
            onSelectTarget={handleAssignTarget}
            onDeleteTarget={handleDeleteTarget}
            pendingPoint={isPlacingTarget ? pendingPoint : null}
            editingTargetId={isEditingTargetPosition ? editingTarget?.id : null}
            onMoveTarget={handleMoveTarget}
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
        {rightPanelMode === "EDIT_TARGET" && editingTarget && (
          <section className="panel-section">
            <h4>Edit Target</h4>

            <label>Name</label>
            <input
              value={editTargetName}
              onChange={(e) =>
                setEditTargetName(e.target.value)
              }
            />

            <label>Description</label>
            <textarea
              value={editTargetDescription}
              onChange={(e) =>
                setEditTargetDescription(e.target.value)
              }
            />

            <button
              onClick={() =>
                setIsEditingTargetPosition((v) => !v)
              }
            >
              📍{" "}
              {isEditingTargetPosition
                ? "Finish Move"
                : "Edit Position"}
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="primary"
                onClick={handleSaveTargetDetails}
              >
                💾 Save
              </button>

              <button
                onClick={() => {
                  setEditingTarget(null);
                  setIsEditingTargetPosition(false);
                  setRightPanelMode("DEFAULT");
                }}
              >
                Cancel
              </button>
            </div>
          </section>
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
              {targets.map((t) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ flex: 1 }}>{t.name}</span>

                  <button
                    onClick={() => handleEditTarget(t)}
                    title="Edit Target"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDeleteTarget(t.id)}
                    title="Delete Target"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {statusMsg && (
  <div
    style={{
      marginTop: 12,
      padding: "8px 10px",
      borderRadius: 8,
      background: "#1e293b",
      color: "white",
      fontSize: 13,
    }}
  >
    {statusMsg}
  </div>)}
      </RightPanel>
    </div>
  );
}
