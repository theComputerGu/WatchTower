import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { User } from "../../models/User";
import {
  getDeviceUsers,
  assignDeviceUsers,
  removeDeviceUser,
} from "../../services/device.service";
import { getUsers, getMyUsers } from "../../services/user.service";

type Props = {
  deviceId: number;
};

export default function DeviceViewersSelector({ deviceId }: Props) {
  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [viewers, setViewers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;

      setLoading(true);

      try {
        const usersPromise =
          currentUser.role === "AREA_ADMIN"
            ? getMyUsers()
            : getUsers();

        const [users, deviceUsers] = await Promise.all([
          usersPromise,
          getDeviceUsers(deviceId),
        ]);

        setAllUsers(users.filter((u: User) => u.role === "USER"));
        setViewers(deviceUsers);
      } catch (err) {
        console.error("Failed to load viewers", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [deviceId, currentUser]);

  function isViewer(userId: string) {
    return viewers.some(u => u.id === userId);
  }

  async function toggleViewer(user: User) {
    if (isViewer(user.id)) {
      await removeDeviceUser(deviceId, user.id);
      setViewers(prev => prev.filter(u => u.id !== user.id));
    } else {
      await assignDeviceUsers(deviceId, [user.id]);
      setViewers(prev => [...prev, user]);
    }
  }

  if (loading) return <p>Loading viewers...</p>;

  return (
    <div style={{ maxHeight: 220, overflowY: "auto" }}>
      {allUsers.map(user => (
        <label key={user.id} style={{ display: "flex", gap: 8 }}>
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
