import {createSlice} from "@reduxjs/toolkit";
import {getPackage} from "../conversation/addition.ts";

export const packageSlice = createSlice({
  name: "package",
  initialState: {
    dialog: false,
    cert: false,
    teenager: false,
  },
  reducers: {
    toggleDialog: (state) => {
      state.dialog = !state.dialog;
    },
    setDialog: (state, action) => {
      state.dialog = action.payload as boolean;
    },
    openDialog: (state) => {
      state.dialog = true;
    },
    closeDialog: (state) => {
      state.dialog = false;
    },
    refreshState: (state, action) => {
      state.cert = action.payload.cert;
      state.teenager = action.payload.teenager;
    },
  }
});

export const {toggleDialog, setDialog, openDialog, closeDialog, refreshState} = packageSlice.actions;
export default packageSlice.reducer;

export const dialogSelector = (state: any): boolean => state.package.dialog;
export const certSelector = (state: any): boolean => state.package.cert;
export const teenagerSelector = (state: any): boolean => state.package.teenager;

const refreshPackage = async (dispatch: any) => {
  const current = new Date().getTime(); //@ts-ignore
  if (window.hasOwnProperty("package") && (current - window.package < 2500)) return; //@ts-ignore
  window.package = current;

  const response = await getPackage();
  if (response.status) dispatch(refreshState(response));
}

export const refreshPackageTask = (dispatch: any) => {
  setInterval(() => refreshPackage(dispatch), 5000);
  refreshPackage(dispatch).then();
}
