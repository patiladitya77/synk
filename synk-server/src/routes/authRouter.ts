import express from "express";
import {
  loginController,
  logoutController,
  signupController,
} from "../controllers/authController";
const authRouter = express.Router();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

authRouter.post("/logout", logoutController);

export default authRouter;
