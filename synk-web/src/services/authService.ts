import {
  addUser,
  removeUser,
  setAccessToken,
  setAuthLoading,
} from "@/utils/userSlice";
type AuthType = "login" | "signup";
import { AppDispatch } from "../utils/appStore";
import api from "@/utils/axiosInterceptor";

interface IPayload {
  name?: string;
  emailId: string;
  password: string;
}
const base_url = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authenticateUser = async (
  authType: AuthType,
  payload: IPayload,
  dispatch: AppDispatch,
  inviteToken?: string,
) => {
  const uri =
    authType === "login"
      ? `${base_url}api/auth/login`
      : `${base_url}api/auth/signup`;

  const res = await api.post(uri, payload, { withCredentials: true });

  if (res.data) {
    dispatch(setAuthLoading(false));
    dispatch(setAccessToken(res.data.accessToken));
    dispatch(addUser(res.data.user));

    //  If invite exists, accept it
    if (inviteToken) {
      const inviteRes = await api.post(
        `${base_url}api/board/invite/${inviteToken}`,
        {},
        { withCredentials: true },
      );

      return {
        ...res,
        inviteSlug: inviteRes.data.slug,
      };
    }
  }
  return res;
};

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
        inviteSlug: inviteRes.data.slug,
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

export const sendOtp = async (email: string) => {
  return await api.post(
    `${base_url}api/auth/forgotpassword`,
    { emailId: email },
    { withCredentials: true },
  );
};

interface IResetPasswordPayload {
  emailId: string;
  newPassword: string;
  otp: string;
}
export const resetPassword = async (payload: IResetPasswordPayload) => {
  return await api.post(`${base_url}api/auth/resetpassword`, payload, {
    withCredentials: true,
  });
};
