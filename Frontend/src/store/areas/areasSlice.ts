import { createSlice } from "@reduxjs/toolkit";

type AreasState = {
  items: [];
  loading: boolean;
};

const initialState: AreasState = {
  items: [],
  loading: false,
};

const areasSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {},
});

export default areasSlice.reducer;
