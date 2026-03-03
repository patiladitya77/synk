import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import canvasReducer from "./canvasSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    canvas: canvasReducer,
  },
});
export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;
export default appStore;
