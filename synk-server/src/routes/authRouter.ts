import express from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  signupController,
} from "../controllers/authController";
const authRouter = express.Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

authRouter.post("/logout", logoutController);

authRouter.post("/forgotpassword", forgotPasswordController);

export default authRouter;
