import { createSlice } from "@reduxjs/toolkit";

type MapState = {
  selectedAreaId: string | null;
};

const initialState: MapState = {
  selectedAreaId: null,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {},
});

export default mapSlice.reducer;
