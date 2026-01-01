import express from "express";
import {
  createBoardController,
  getAllBoardsController,
} from "../controllers/boardController";
import { userAuth } from "../middleware/userAuth";
const boardRouter = express.Router();

boardRouter.post("/create", userAuth, createBoardController);
boardRouter.get("/getboards", userAuth, getAllBoardsController);

export default boardRouter;
