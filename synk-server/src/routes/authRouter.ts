import express from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  refreshController,
  resetPasswordController,
  signupController,
} from "../controllers/authController";
import { userAuth } from "../middleware/userAuth";
const authRouter = express.Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

authRouter.post("/logout", logoutController);

authRouter.post("/forgotpassword", forgotPasswordController);

authRouter.post("/resetpassword", resetPasswordController);

authRouter.post("/refresh", refreshController);

authRouter.get("/me", userAuth, meController);
export default authRouter;
