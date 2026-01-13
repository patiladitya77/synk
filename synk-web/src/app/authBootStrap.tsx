"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { rehydrateAuth } from "@/lib/auth";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    rehydrateAuth(dispatch);
  }, [dispatch]);

  return null;
}
