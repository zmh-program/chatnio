import { configureStore } from '@reduxjs/toolkit'
import menuReducer from './menu'
import authReducer from './auth'

const store = configureStore({
  reducer: {
    menu: menuReducer,
    auth: authReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export type {RootState, AppDispatch};
export default store;
