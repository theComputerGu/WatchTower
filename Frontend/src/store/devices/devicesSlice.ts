import { createSlice } from "@reduxjs/toolkit";

type DevicesState = {
  items: [];
  loading: boolean;
};

const initialState: DevicesState = {
  items: [],
  loading: false,
};

const devicesSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {},
});

export default devicesSlice.reducer;
