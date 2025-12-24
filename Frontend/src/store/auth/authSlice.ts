import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../models/User";

type AuthState = {
  token: string | null;
  user: User | null;
};


//local storage that holds the token - after refresh i can still stay connect:
const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? (JSON.parse(localStorage.getItem("user")!) as User)
    : null,
};



const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //taking the token
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      //local storage:
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    //no token + local storgae get ckear:
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.clear();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
