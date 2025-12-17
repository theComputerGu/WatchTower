import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import areasReducer from "./areas/areasSlice";
import devicesReducer from "./devices/devicesSlice";
import mapReducer from "./map/mapSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    areas: areasReducer,
    devices: devicesReducer,
    map: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
