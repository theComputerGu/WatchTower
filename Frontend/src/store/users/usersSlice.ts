import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "../../models/User";
import { getUsers } from "../../services/user.service";

type UsersState = {
  items: User[];
  loading: boolean;
};

//in the start we dont have users:
const initialState: UsersState = {
  items: [],
  loading: false,
};

//get the all users
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async () => {
    return await getUsers();
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  },
});

export default usersSlice.reducer;
