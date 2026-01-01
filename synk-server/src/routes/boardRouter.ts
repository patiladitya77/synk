import express from "express";
import { createBoardController } from "../controllers/boardController";
import { userAuth } from "../middleware/userAuth";
const boardRouter = express.Router();

boardRouter.post("/create", userAuth, createBoardController);

export default boardRouter;
