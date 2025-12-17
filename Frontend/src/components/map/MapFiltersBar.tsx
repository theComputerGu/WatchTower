export default function MapFiltersBar() {
  return (
    <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
      <select><option>Select Area</option></select>
      <select><option>Device Type</option></select>
      <select><option>Status</option></select>
    </div>
  );
}
