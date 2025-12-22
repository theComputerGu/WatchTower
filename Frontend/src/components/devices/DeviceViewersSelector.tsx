import { useEffect, useState } from "react";
import type { User } from "../../models/User";
import {
  getDeviceUsers,
  assignDeviceUsers,
  removeDeviceUser,
} from "../../services/device.service";
import { getUsers } from "../../services/user.service"; // כבר יש לך

type Props = {
  deviceId: number;
};

export default function DeviceViewersSelector({ deviceId }: Props) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [viewers, setViewers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [users, deviceUsers] = await Promise.all([
        getUsers(),
        getDeviceUsers(deviceId),
      ]);

      // רק USERS רגילים
      setAllUsers(users.filter((u) => u.role === "USER"));
      setViewers(deviceUsers);

      setLoading(false);
    }

    load();
  }, [deviceId]);

  function isViewer(userId: string) {
    return viewers.some((u) => u.id === userId);
  }

  async function toggleViewer(user: User) {
    if (isViewer(user.id)) {
      await removeDeviceUser(deviceId, user.id);
      setViewers((prev) =>
        prev.filter((u) => u.id !== user.id)
      );
    } else {
      await assignDeviceUsers(deviceId, [user.id]);
      setViewers((prev) => [...prev, user]);
    }
  }

  if (loading) return <p>Loading viewers...</p>;

  return (
    <div
      style={{
        maxHeight: 220,
        overflowY: "auto",
        border: "1px solid #1f2937",
        borderRadius: 8,
        padding: 8,
      }}
    >
      {allUsers.map((user) => (
        <label
          key={user.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 4px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isViewer(user.id)}
            onChange={() => toggleViewer(user)}
          />
          <span>{user.username}</span>
        </label>
      ))}
    </div>
  );
}
