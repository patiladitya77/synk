import {
  addUser,
  removeUser,
  setAccessToken,
  setAuthLoading,
} from "@/utils/userSlice";
import { AppDispatch } from "../utils/appStore";
import api from "@/utils/axiosInterceptor";

const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authenticateWithGoogle = async (
  idToken: string,
  dispatch: AppDispatch,
  inviteToken?: string,
) => {
  const res = await api.post(
    `${base_url}api/auth/google`,
    { idToken },
    { withCredentials: true },
  );

  if (res.data) {
    dispatch(setAuthLoading(false));
    dispatch(setAccessToken(res.data.accessToken));
    dispatch(addUser(res.data.user));

    if (inviteToken) {
      const inviteRes = await api.post(
        `${base_url}api/board/invite/${inviteToken}`,
        {},
        { withCredentials: true },
      );

      return {
        ...res,
        inviteSlug: inviteRes.data.boardId || inviteRes.data.slug,
      };
    }
  }

  return res;
};

export const logoutUser = async (dispatch: AppDispatch) => {
  try {
    await api.post(`${base_url}api/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.warn("Server logout failed:", error);
  } finally {
    // clearing client state
    dispatch(removeUser());
    dispatch(setAuthLoading(false));
  }
};





