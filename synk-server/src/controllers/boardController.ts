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
