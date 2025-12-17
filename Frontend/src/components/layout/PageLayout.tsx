import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function PageLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <TopBar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
