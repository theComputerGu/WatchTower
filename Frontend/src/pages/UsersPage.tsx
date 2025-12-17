import RightPanel from "../components/map/RightPanel";

export default function UsersPage() {
  return (
    <div className="page">
      <div className="table">Users Table Placeholder</div>
      <RightPanel title="Edit User">
        <input placeholder="Name" />
        <input placeholder="Email" />
        <button className="primary">Save</button>
      </RightPanel>
    </div>
  );
}
