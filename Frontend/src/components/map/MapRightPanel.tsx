import type { MapFilters, MapStatsDto } from "../../types/map.types";

type Props = {
  stats?: MapStatsDto;
  filters: MapFilters;
  onChangeFilters: (f: MapFilters) => void;
  areas?: { id: number; name: string }[];
};

export default function MapRightPanel({
  stats,
  filters,
  onChangeFilters,
  areas = [],
}: Props) {
  return (
    <aside className="map-right-panel">
      {/* 🔥 CONTENT */}
      <div className="mrp-content">

        {/* ===== STATS ===== */}
        <div className="mrp-stats">
          <div className="mrp-card">
            <div className="mrp-card-label">Areas</div>
            <div className="mrp-card-value">{stats?.areas ?? 0}</div>
          </div>
          <div className="mrp-card">
            <div className="mrp-card-label">Cameras</div>
            <div className="mrp-card-value">{stats?.cameras ?? 0}</div>
          </div>
          <div className="mrp-card">
            <div className="mrp-card-label">Radars</div>
            <div className="mrp-card-value">{stats?.radars ?? 0}</div>
          </div>
          <div className="mrp-card mrp-card-green">
            <div className="mrp-card-label">Active</div>
            <div className="mrp-card-value">{stats?.active ?? 0}</div>
          </div>
          <div className="mrp-card mrp-card-red">
            <div className="mrp-card-label">Offline</div>
            <div className="mrp-card-value">{stats?.offline ?? 0}</div>
          </div>
        </div>

        <div className="mrp-divider" />

        {/* ===== FILTERS ===== */}
        <div className="mrp-section-title">Filters</div>

        <label className="mrp-label">Area</label>
        <select
          className="mrp-select"
          value={filters.areaId ?? ""}
          onChange={(e) =>
            onChangeFilters({
              ...filters,
              areaId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <label className="mrp-label">Device Type</label>
        <select
          className="mrp-select"
          value={filters.deviceType ?? ""}
          onChange={(e) =>
            onChangeFilters({
              ...filters,
              deviceType: (e.target.value as any) || undefined,
            })
          }
        >
          <option value="">All</option>
          <option value="Camera">Camera</option>
          <option value="Radar">Radar</option>
        </select>

        <label className="mrp-label">Status</label>
        <select
          className="mrp-select"
          value={filters.status ?? ""}
          onChange={(e) =>
            onChangeFilters({
              ...filters,
              status: (e.target.value as any) || undefined,
            })
          }
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* 🔥 RESET – תמיד גלוי */}
      <button
        className="mrp-reset"
        onClick={() => onChangeFilters({})}
      >
        Reset
      </button>
    </aside>
  );
}
