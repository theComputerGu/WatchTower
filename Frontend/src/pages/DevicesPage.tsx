import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";

export default function DevicesPage() {
  return (
    <div className="page">
      <MapView />
      <RightPanel title="Edit Camera / Radar">
        <select>
          <option>Camera</option>
          <option>Radar</option>
        </select>
        <button className="primary">Save</button>
      </RightPanel>
    </div>
  );
}
