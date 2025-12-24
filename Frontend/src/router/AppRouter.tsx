import { Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MapPage from "../pages/MapPage";
import AreasPage from "../pages/AreasPage";
import PlacesPage from "../pages/PlacesPage";
import DevicesPage from "../pages/DevicesPage";
import UsersPage from "../pages/UsersPage";


export default function AppRouter() {

  return (

    <Routes>
      {/* public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* app pages */}
      <Route element={<PageLayout />}>
        <Route path="/map" element={<MapPage />} />
        <Route path="/areas" element={<AreasPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      {/* if has error path */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
