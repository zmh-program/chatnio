import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menu";
import authReducer from "./auth";
import chatReducer from "./chat";
import quotaReducer from "./quota";
import packageReducer from "./package";
import subscriptionReducer from "./subscription";
import apiReducer from "./api";
import sharingReducer from "./sharing";
import invitationReducer from "./invitation";

const store = configureStore({
  reducer: {
    menu: menuReducer,
    auth: authReducer,
    chat: chatReducer,
    quota: quotaReducer,
    package: packageReducer,
    subscription: subscriptionReducer,
    api: apiReducer,
    sharing: sharingReducer,
    invitation: invitationReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };
export default store;
