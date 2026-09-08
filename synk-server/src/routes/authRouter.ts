import express from "express";
import {
  logoutController,
  meController,
  refreshController,
} from "../controllers/authController";
import { userAuth } from "../middleware/userAuth";
import { googleAuthController } from "../controllers/googleAuthController";
const authRouter = express.Router();


authRouter.post("/logout", logoutController);


authRouter.post("/refresh", refreshController);

authRouter.get("/me", userAuth, meController);

authRouter.post("/google", googleAuthController);
export default authRouter;
