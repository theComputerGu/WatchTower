import type { User } from "../../models/User";

interface Props {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function DeviceUsersSelector({
  users,
  selectedIds,
  onChange,
}: Props) {
  function toggleUser(userId: string, checked: boolean) {
    if (checked) {
      // add user
      onChange([...selectedIds, userId]);
    } else {
      // remove user
      onChange(selectedIds.filter((id) => id !== userId));
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ marginBottom: 8 }}>Assigned Users</h4>

      {users.length === 0 && (
        <p style={{ opacity: 0.6 }}>No users available</p>
      )}

      {users.map((u) => (
        <label
          key={u.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(u.id)}
            onChange={(e) =>
              toggleUser(u.id, e.target.checked)
            }
          />

          <span>{u.username}</span>
        </label>
      ))}
    </div>
  );
}
