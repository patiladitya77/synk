import express from "express";
import {
  checkName,
  createBoardController,
  getAllBoardsController,
} from "../controllers/boardController";
import { userAuth } from "../middleware/userAuth";
const boardRouter = express.Router();

boardRouter.post("/create", userAuth, createBoardController);
boardRouter.get("/getboards", userAuth, getAllBoardsController);
boardRouter.get("/checkname", userAuth, checkName);

export default boardRouter;
