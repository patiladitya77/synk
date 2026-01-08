import { addUser, removeUser } from "@/utils/userSlice";
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
  if (res.data) {
    dispatch(addUser(res.data.savedUser));
  }
  return res;
};

export const logoutUser = async (dispatch: AppDispatch) => {
  const res = await axios.post(
    `${base_url}api/auth/logout`,
    {},
    { withCredentials: true },
  );
  if (res.data) dispatch(removeUser());

  return res;
};
