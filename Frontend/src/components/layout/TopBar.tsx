import { useNavigate } from "react-router-dom";
import useAppSelector from "../../hooks/useAppSelector";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { logout } from "../../store/auth/authSlice";

export default function TopBar() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Homepage
  };

  return (
    <header className="topbar">
      <div className="topbar__left" />

      <div className="topbar__right">
        {user && (
          <div className="user-chip">
            {/* Avatar (Logout) */}
            <div
              className="user-chip__avatar"
              onClick={handleLogout}
              title="Logout"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div className="user-chip__info">
              <div className="user-chip__row">
                <span className="user-chip__label">Username: </span>
                <span className="user-chip__value">
                  {user.username}
                </span>
              </div>

              <div className="user-chip__row">
                <span className="user-chip__label">Role: </span>
                <span
                  className={`user-chip__value role-${user.role}`}
                >
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function formatRole(role: string) {
  switch (role) {
    case "GLOBAL_ADMIN":
      return "System Admin";
    case "AREA_ADMIN":
      return "Area Admin";
    case "USER":
      return "User";
    default:
      return "Guest";
  }
}
