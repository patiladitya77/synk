import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/authTokens";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthController = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    //  Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleUserId, email, name, picture } = payload;

    //  Upsert user + provider in transaction

    let user = await prisma.user.findUnique({
      where: { emailId: email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          emailId: email,
          name: name || "Google User",
          avatarUrl: picture,
        },
      });
    }

    //  Link Google provider if not exists
    await prisma.authProvider.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "google",
        },
      },
      update: {
        providerUserId: googleUserId,
      },
      create: {
        userId: user.id,
        provider: "google",
        providerUserId: googleUserId,
      },
    });

    const activeSessionCount = await prisma.session.count({
      where: {
        userId: user.id,
        revokedAt: null,
      },
    });

    if (activeSessionCount >= 5) {
      return res.status(403).json({
        message: "Too many active sessions",
      });
    }

    //  Create session (same as login)
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    const accessToken = generateAccessToken(user.id);

    //update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    //  Set cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        emailId: user.emailId,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};
