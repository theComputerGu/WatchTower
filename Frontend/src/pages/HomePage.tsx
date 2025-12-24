import { Link } from "react-router-dom";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import RadarLoader from "../components/ui/RadarLoader";

export default function HomePage() {
  return (
    <>

      <AnimatedBackground />
        <div className="auth-page">
          <div className="auth-card" style={{ textAlign: "center" }}>

            <h1>WatchTower</h1>

            <p>
              Centralized monitoring and management system
              <br />
              for cameras and radars
            </p>

            <RadarLoader />

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Link to="/login" style={{ flex: 1 }}>
                <button className="primary">Sign In</button>
              </Link>

              <Link to="/register" style={{ flex: 1 }}>
                <button className="primary">Sign Up</button>
              </Link>
            </div>

          </div>
          
        </div>
    </>
  );
}
