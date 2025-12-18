// src/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import RightPanel from "../components/map/RightPanel";
import type { User } from "../models/User";
import type { Area } from "../models/Area";
import { getUsers, updateUser } from "../services/user.service";
import { getUnassignedAreas } from "../services/area.service";
import { ROLES } from "../utils/roles";
import type { Role } from "../utils/roles";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadAreas() {
    const data = await getUnassignedAreas();
    setAreas(data);
  }

  async function onSave() {
    if (!selectedUser) return;

    try {
      setSaving(true);

      await updateUser(selectedUser.id, {
        role: selectedUser.role,
        areaId:
          selectedUser.role === ROLES.AREA_ADMIN
            ? selectedUser.areaId
            : undefined,
      });

      await loadUsers();
      setSelectedUser(null);
      alert("User updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading users…</div>;
  }

  return (
    <div className="page users-page">
      {/* ===== Users Table ===== */}
      <div className="users-table">
        <div className="table-header">
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
          <span>Area</span>
        </div>

        {users.map((u) => (
          <div
            key={u.id}
            className={`table-row ${
              selectedUser?.id === u.id ? "active" : ""
            }`}
            onClick={() => {
              setSelectedUser(u);
              if (u.role === ROLES.AREA_ADMIN) {
                loadAreas();
              }
            }}
          >
            <span>{u.email}</span>
            <span>{u.username}</span>
            <span>{u.role}</span>
            <span>{u.areaName ?? "-"}</span>
          </div>
        ))}
      </div>

      {/* ===== Right Panel ===== */}
      <RightPanel title="Edit User">
        {!selectedUser && <p>Select a user to edit</p>}

        {selectedUser && (
          <div className="edit-form">
            <label>Email</label>
            <input value={selectedUser.email} disabled />

            {/* ===== Role ===== */}
            <label>Role</label>
            <select
              value={selectedUser.role}
              onChange={(e) => {
                const role = e.target.value as Role;

                setSelectedUser({
                  ...selectedUser,
                  role,
                  areaId: role === ROLES.AREA_ADMIN ? undefined : undefined,
                  areaName: undefined,
                });

                if (role === ROLES.AREA_ADMIN) {
                  loadAreas();
                }
              }}
            >
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.AREA_ADMIN}>Area Admin</option>
            </select>

            {/* ===== Area selector ===== */}
            {selectedUser.role === ROLES.AREA_ADMIN && (
              <>
                <label>Assigned Area</label>
                <select
                  value={selectedUser.areaId ?? ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      areaId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">-- Select Area --</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              className="primary"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </RightPanel>
    </div>
  );
}
