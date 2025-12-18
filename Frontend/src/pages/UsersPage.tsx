// src/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import RightPanel from "../components/map/RightPanel";
import type { User } from "../models/User";
import { getUsers, updateUser } from "../services/user.service";
import { ROLES } from "../utils/roles";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  async function onSave() {
    if (!selectedUser) return;

    try {
      setSaving(true);

      await updateUser(selectedUser.id, {
        role: selectedUser.role,
        areaId: selectedUser.areaId, // undefined אם אין
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
      {/* טבלה */}
      <div className="users-table">
        <div className="table-header">
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
          <span>Area</span>
        </div>

        {users.map(u => (
          <div
            key={u.id}
            className={`table-row ${selectedUser?.id === u.id ? "active" : ""}`}
            onClick={() => setSelectedUser(u)}
          >
            <span>{u.email}</span>
            <span>{u.username}</span>
            <span>{u.role}</span>
            <span>{u.areaName ?? "-"}</span>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <RightPanel title="Edit User">
        {!selectedUser && <p>Select a user to edit</p>}

        {selectedUser && (
          <div className="edit-form">
            <label>Email</label>
            <input value={selectedUser.email} disabled />

            <label>Role</label>
            <select
              value={selectedUser.role}
              onChange={e =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value as any,
                  // שינוי Role לא משייך אזור
                  areaId: undefined,
                  areaName: undefined,
                })
              }
            >
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.AREA_ADMIN}>Area Admin</option>
            </select>

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
