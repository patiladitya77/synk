import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateAccessToken } from "../utils/authTokens";


export const refreshController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const accessToken = generateAccessToken(session.userId);

  res.json({ accessToken });
};

export const meController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        emailId: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({
      user,
    });
  } catch (err) {
    console.error("ME error:", err);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};



export const logoutController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await prisma.session.updateMany({
        where: {
          refreshToken,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear cookie even if DB fails
    res.clearCookie("refreshToken");

    return res.json({ message: "Logout successful" });
  }
};
