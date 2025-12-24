import type { Target } from "../../models/Target";

interface Props {
  targets: Target[];
  selectedTargetId?: number | null;
  onSelect: (targetId: number) => void;
  onClear: () => void;
}

export default function DeviceTargetSelector({targets,selectedTargetId,
onSelect,
  onClear,
}: Props) {
  return (
    <div style={{ marginTop: 8 }}>
      <select
        value={selectedTargetId ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") return onClear();
          onSelect(Number(val));
        }}
      >
        <option value="">— No Target —</option>

        {targets.map((t) => (
          <option key={t.id} value={t.id}>
            🎯 {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
