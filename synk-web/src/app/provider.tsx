"use client";

import { Provider } from "react-redux";
import appStore from "@/utils/appStore";
import AuthBootstrap from "./authBootStrap";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={appStore}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
