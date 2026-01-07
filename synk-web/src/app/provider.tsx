"use client";

import { Provider } from "react-redux";
import appStore from "@/utils/appStore";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={appStore}>{children}</Provider>;
}
