import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generateSlug";
import crypto from "crypto";
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

export const generateInviteLinkController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { boardId } = req.params;
    const user = req.user;
    if (!user) {
      return res.json({ message: "user does not exists" });
    }
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board || board.ownerId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (
      board?.inviteToken &&
      board.isInviteEnabled &&
      board.inviteTokenExpiresAt &&
      board.inviteTokenExpiresAt > new Date()
    ) {
      const existingLink = `${process.env.ORIGIN_URL}invite/${board.inviteToken}`;

      return res.json({
        inviteLink: existingLink,
        message: "Invite link already exists",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await prisma.board.update({
      where: { id: board.id },
      data: {
        inviteToken: token,
        inviteTokenExpiresAt: expiresAt,
        isInviteEnabled: true,
      },
    });

    const inviteLink = `${process.env.ORIGIN_URL}invite/${token}`;
    res.json({ message: "link created successfully", inviteLink, expiresAt });
  } catch {
    res.status(400).json({
      message: "An error occured",
    });
  }
};

export const acceptInviteController = async (req: Request, res: Response) => {
  try {
    console.log("control reached");
    const { token } = req.params;
    console.log("token: ", token);
    const user = req.user;
    if (!user) {
      return res.json("User does not exixts");
    }
    console.log("user: ", user);
    const board = await prisma.board.findFirst({
      where: {
        inviteToken: token,
        isInviteEnabled: true,
        inviteTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });
    console.log("query one sucess");
    if (!board) {
      return res.status(400).json("Invalid or expired invite link");
    }
    await prisma.boardCollaborator.upsert({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        boardId: board.id,
        userId: user.id,
        role: "EDITOR",
      },
    });
    console.log("accept invite api ran successfully");
    res.json({ message: "Invite accepted successfully", boardId: board.slug });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};
