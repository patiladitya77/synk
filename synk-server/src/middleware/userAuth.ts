import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import AuthProvider from "../models/AuthProvider";
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    /**
     * Ensure user has at least one auth provider
     * (password OR google)
     */
    const authProviderExists = await AuthProvider.exists({
      userId: user._id,
    });

    if (!authProviderExists) {
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
