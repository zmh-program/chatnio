import { createSlice } from "@reduxjs/toolkit";
import { mobile } from "@/utils/device.ts";

export const menuSlice = createSlice({
  name: "menu",
  initialState: {
    open: !mobile, // mobile: false, desktop: true
  },
  reducers: {
    toggleMenu: (state) => {
      state.open = !state.open;
    },
    closeMenu: (state) => {
      state.open = false;
    },
    openMenu: (state) => {
      state.open = true;
    },
    setMenu: (state, action) => {
      state.open = action.payload as boolean;
    },
  },
});

export const { toggleMenu, closeMenu, openMenu, setMenu } = menuSlice.actions;
export default menuSlice.reducer;

export const selectMenu = (state: any) => state.menu.open;
