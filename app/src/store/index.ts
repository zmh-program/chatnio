import { configureStore } from "@reduxjs/toolkit";
import infoReducer from "./info";
import globalReducer from "./globals";
import menuReducer from "./menu";
import authReducer from "./auth";
import chatReducer from "./chat";
import quotaReducer from "./quota";
import packageReducer from "./package";
import subscriptionReducer from "./subscription";
import apiReducer from "./api";
import sharingReducer from "./sharing";
import invitationReducer from "./invitation";
import settingsReducer from "./settings";

const store = configureStore({
  reducer: {
    info: infoReducer,
    global: globalReducer,
    menu: menuReducer,
    auth: authReducer,
    chat: chatReducer,
    quota: quotaReducer,
    package: packageReducer,
    subscription: subscriptionReducer,
    api: apiReducer,
    sharing: sharingReducer,
    invitation: invitationReducer,
    settings: settingsReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };
export default store;
