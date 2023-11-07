import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { tokenField } from "@/conf.ts";
import { AppDispatch, RootState } from "./index.ts";
import { forgetMemory, setMemory } from "@/utils/memory.ts";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: "",
    init: false,
    authenticated: false,
    admin: false,
    username: "",
  },
  reducers: {
    setToken: (state, action) => {
      const token = (action.payload as string).trim();
      state.token = token;
      axios.defaults.headers.common["Authorization"] = token;
      if (token.length > 0) setMemory(tokenField, token);
    },
    setAuthenticated: (state, action) => {
      state.authenticated = action.payload as boolean;
    },
    setUsername: (state, action) => {
      state.username = action.payload as string;
    },
    setInit: (state, action) => {
      state.init = action.payload as boolean;
    },
    setAdmin: (state, action) => {
      state.admin = action.payload as boolean;
    },
    logout: (state) => {
      state.token = "";
      state.authenticated = false;
      state.username = "";
      axios.defaults.headers.common["Authorization"] = "";
      forgetMemory(tokenField);

      location.reload();
    },
  },
});

export function validateToken(
  dispatch: AppDispatch,
  token: string,
  hook?: () => any,
) {
  token = token.trim();
  dispatch(setToken(token));

  if (token.length === 0) {
    dispatch(setAuthenticated(false));
    dispatch(setUsername(""));
    dispatch(setInit(true));
    return;
  } else
    axios
      .post("/state")
      .then((res) => {
        dispatch(setAuthenticated(res.data.status));
        dispatch(setUsername(res.data.user));
        dispatch(setInit(true));
        dispatch(setAdmin(res.data.admin));
        hook && hook();
      })
      .catch((err) => {
        // keep state
        console.debug(err);
      });
}

export const selectAuthenticated = (state: RootState) =>
  state.auth.authenticated;
export const selectUsername = (state: RootState) => state.auth.username;
export const selectInit = (state: RootState) => state.auth.init;
export const selectAdmin = (state: RootState) => state.auth.admin;

export const {
  setToken,
  setAuthenticated,
  setUsername,
  logout,
  setInit,
  setAdmin,
} = authSlice.actions;
export default authSlice.reducer;
