// export default function MapStatsBar() {
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
//       {[
//         ["Areas", 4],
//         ["Cameras", 12],
//         ["Radars", 8],
//         ["Active", 19],
//         ["Offline", 5],
//       ].map(([label, value]) => (
//         <div
//           key={label}
//           style={{
//             background: "linear-gradient(180deg,#1f2937,#020617)",
//             border: "1px solid #1f2937",
//             borderRadius: 14,
//             padding: 16,
//           }}
//         >
//           <div style={{ color: "#9ca3af", fontSize: 13 }}>{label}</div>
//           <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }
