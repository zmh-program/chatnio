import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menu'
import authReducer from './auth'
import chatReducer from './chat'

const store = configureStore({
  reducer: {
    menu: menuReducer,
    auth: authReducer,
    chat: chatReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type {RootState, AppDispatch};
export default store;
