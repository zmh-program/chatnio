import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./menu";
import authReducer from "./auth";
import chatReducer from "./chat";
import quotaReducer from "./quota";

const store = configureStore({
  reducer: {
    menu: menuReducer,
    auth: authReducer,
    chat: chatReducer,
    quota: quotaReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type { RootState, AppDispatch };
export default store;
