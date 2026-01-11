import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "../utils/types";

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Please login" });
    }

    //  Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const { userId } = decoded;

    //  Fetch user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    /**
     * Ensure user has at least one auth provider
     * (password OR google)
     */
    const authProvider = await prisma.authProvider.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!authProvider) {
      return res.status(401).json({ message: "Auth provider missing" });
    }

    //  Attach user to request
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      message: "Unauthorized",
      error: err.message,
    });
  }
};
