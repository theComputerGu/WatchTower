// import { useEffect, useState } from "react";
// import type { User } from "../../models/User";
// import type { Area } from "../../models/Area";
// import { updateUser } from "../../services/user.service";
// import { getUnassignedAreas } from "../../services/area.service";
// import { ROLES } from "../../utils/roles";
// import type { Role } from "../../utils/roles";

// type Props = {
//   user: User;
//   onClose: () => void;
//   onSaved: () => void;
// };

// export default function UserEditPanel({ user, onClose, onSaved }: Props) {


//   const [role, setRole] = useState(user.role);
//   const [areaId, setAreaId] = useState<number | null>(user.areaId ?? null);
//   const [areas, setAreas] = useState<Area[]>([]);
//   const [saving, setSaving] = useState(false);



//   useEffect(() => {
//   if (role === ROLES.AREA_ADMIN) {
//     loadAreas();
//   }
// }, [role, user.id]);



//  async function loadAreas() {
//   const data = await getUnassignedAreas();
//   setAreas(data);
// }

//   async function save() {
//     setSaving(true);
//     await updateUser(user.id, {
//       role,
//       areaId: role === ROLES.AREA_ADMIN ? areaId ?? undefined : undefined,
//     });
//     setSaving(false);
//     onSaved();
//   }

//   return (
//     <div className="user-edit-panel">
//       <h2>Edit User</h2>

//       <label>Role</label>
//       <select
//   value={role}
//   onChange={(e) => setRole(e.target.value as Role)}
// >
//         <option value={ROLES.USER}>User</option>
//         <option value={ROLES.AREA_ADMIN}>Area Admin</option>
//       </select>

//       {role === ROLES.AREA_ADMIN && (
//         <>
//           <label>Assigned Area</label>
//           <select
//             value={areaId ?? ""}
//             onChange={e => setAreaId(Number(e.target.value))}
//           >
//             <option value="">-- Select Area --</option>
//             {areas.map(a => (
//               <option key={a.id} value={a.id}>
//                 {a.name}
//               </option>
//             ))}
//           </select>
//         </>
//       )}

//       <div className="actions">
//         <button onClick={save} disabled={saving}>
//           Save
//         </button>
//         <button onClick={onClose}>Cancel</button>
//       </div>
//     </div>
//   );
// }
