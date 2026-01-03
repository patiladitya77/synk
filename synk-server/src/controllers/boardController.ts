import { Request, Response } from "express";
import Board from "../models/Board";
import { generateSlug } from "../utils/generateSlug";

export const createBoardController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json({ message: "User does not exist" });
    }
    const { title } = req.body;
    if (!title) return res.json({ message: "title requried" });
    const slug = generateSlug(title);
    const board = await new Board({
      title,
      slug,
      ownerId: user._id,
      collaborators: [
        {
          userId: user._id,
          role: "editor",
        },
      ],
    });
    const savedBoard = await board.save();
    res.json({ message: "Board created successfully", savedBoard });
  } catch (err) {
    res.status(400).json({ message: "Failed to create board-  " + err });
  }
};

export const getAllBoardsController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json({ message: "User does not exist" });
    }
    const boards = await Board.find({
      isArchived: false,
      $or: [{ ownerId: user._id }, { "collaborators.userId": user._id }],
    }).sort({ updatedAt: -1 });
    res.json({ message: "fetched successfully", boards });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch board-  " + err });
  }
};

export const checkName = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const title = (req.query.title as string).trim();
    if (!title) return res.json({ message: "Title is empty" });
    const exists = await Board.exists({
      ownerId: user?._id,
      title: title.trim(),
    });
    res.json({
      available: !exists,
    });
  } catch (error) {
    res.json({ message: "ERROR: " + error });
  }
};
