import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";
import MapStatsBar from "../components/map/MapStatsBar";
import MapFiltersBar from "../components/map/MapFiltersBar";

export default function MapPage() {
  return (
    <>
      <MapStatsBar />
      <MapFiltersBar />

      <div className="page">
        <MapView />

        <RightPanel title="Edit Area">
          <label>Area Name</label>
          <input placeholder="Central District" />
          <button className="primary">Save</button>
        </RightPanel>
      </div>
    </>
  );
}
