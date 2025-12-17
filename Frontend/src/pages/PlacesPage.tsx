import MapView from "../components/map/MapView";
import RightPanel from "../components/map/RightPanel";

export default function PlacesPage() {
  return (
    <div className="page">
      <MapView />
      <RightPanel title="Edit Place">
        <input placeholder="Place Name" />
        <button className="primary">Save</button>
      </RightPanel>
    </div>
  );
}
