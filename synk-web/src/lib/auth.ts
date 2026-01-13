"use client";
import {
  addUser,
  removeUser,
  setAccessToken,
  setAuthLoading,
} from "@/utils/userSlice";
import axios from "axios";

export const rehydrateAuth = async (dispatch: any) => {
  try {
    dispatch(setAuthLoading(true));
    const refreshRes = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}api/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const accessToken = refreshRes.data.accessToken;
    dispatch(setAccessToken(accessToken));

    const meRes = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      }
    );

    dispatch(addUser(meRes.data.user));
  } catch {
    dispatch(removeUser());
  } finally {
    dispatch(setAuthLoading(false));
  }
};
