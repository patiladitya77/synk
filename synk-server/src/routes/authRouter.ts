import express from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  resetPasswordController,
  signupController,
} from "../controllers/authController";
const authRouter = express.Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

authRouter.post("/logout", logoutController);

authRouter.post("/forgotpassword", forgotPasswordController);

authRouter.post("/resetpassword", resetPasswordController);
export default authRouter;
