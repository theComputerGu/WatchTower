import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";

export default function AreasPage() {
  return (
    <div className="page">
      <MapView />
      <RightPanel title="Edit Area">
        <input placeholder="Area Name" />
        <button className="primary">Save</button>
      </RightPanel>
    </div>
  );
}
