import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
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
    const savedBoard = await prisma.board.create({
      data: {
        title,
        slug,
        ownerId: user.id,

        collaborators: {
          create: {
            userId: user.id,
            role: "EDITOR",
          },
        },
      },
      include: {
        collaborators: true,
      },
    });
    res.json({ message: "Board created successfully", savedBoard });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Board with same name already exists",
      });
    }

    res.status(400).json({
      message: "Failed to create board",
    });
  }
};

export const getAllBoardsController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json({ message: "User does not exist" });
    }
    const boards = await prisma.board.findMany({
      where: {
        isArchived: false,
        OR: [
          { ownerId: user.id },
          {
            collaborators: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        collaborators: true,
      },
    });
    res.json({ message: "fetched successfully", boards });
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch board-  " + err });
  }
};

export const checkName = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const rawTitle = (req.query.title as string | undefined)?.trim();
    if (!rawTitle) {
      return res.json({ available: false });
    }

    const slug = generateSlug(rawTitle);

    const exists = await prisma.board.findUnique({
      where: {
        ownerId_slug: {
          ownerId: user.id,
          slug,
        },
      },
      select: { id: true },
    });

    res.json({
      available: !exists,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to check board name",
    });
  }
};
