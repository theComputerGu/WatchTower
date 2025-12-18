import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import areasReducer from "./areas/areasSlice";
import devicesReducer from "./devices/devicesSlice";
import mapReducer from "./map/mapSlice";
import usersReducer from "./users/usersSlice";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    areas: areasReducer,
    devices: devicesReducer,
    map: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
