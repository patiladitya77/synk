import {
  addUser,
  removeUser,
  setAccessToken,
  setAuthLoading,
} from "@/utils/userSlice";
import axios from "axios";
type AuthType = "login" | "signup";
import { AppDispatch } from "../utils/appStore";
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
) => {
  const uri =
    authType === "login"
      ? `${base_url}api/auth/login`
      : `${base_url}api/auth/signup`;

  const res = await axios.post(uri, payload, { withCredentials: true });
  console.log(res);
  if (res.data) {
    dispatch(setAuthLoading(false));
    dispatch(setAccessToken(res.data.accessToken));
    dispatch(addUser(res.data.user));
  }
  return res;
};

export const authenticateWithGoogle = async (
  idToken: string,
  dispatch: AppDispatch,
) => {
  const res = await axios.post(
    `${base_url}api/auth/google`,
    { idToken },
    { withCredentials: true },
  );

  if (res.data) {
    dispatch(setAuthLoading(false));
    dispatch(setAccessToken(res.data.accessToken));
    dispatch(addUser(res.data.user));
  }

  return res;
};

export const logoutUser = async (dispatch: AppDispatch) => {
  try {
    await axios.post(
      `${base_url}api/auth/logout`,
      {},
      { withCredentials: true },
    );
  } catch (error) {
    console.warn("Server logout failed:", error);
  } finally {
    // clearing client state
    dispatch(removeUser());
    dispatch(setAuthLoading(false));
  }
};

export const sendOtp = async (email: string) => {
  return await axios.post(
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
  return await axios.post(`${base_url}api/auth/resetpassword`, payload, {
    withCredentials: true,
  });
};
