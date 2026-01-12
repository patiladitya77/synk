import { Request, Response } from "express";
import validateSignUpData from "../utils/validation";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/authTokens";
export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, emailId, password } = req.body;

    //  Validate request
    validateSignUpData(req);

    //  Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    //  Transaction: user + auth provider
    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          emailId,
        },
      });

      await tx.authProvider.create({
        data: {
          userId: user.id,
          provider: "password",
          providerUserId: user.id, // internal mapping
          passwordHash,
        },
      });

      return user;
    });
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

    //  Set cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Signup successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        emailId: user.emailId,
      },
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(400).json({ message: "Signup failed" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;

    /*  Find user */
    const user = await prisma.user.findUnique({
      where: { emailId },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /*  Get password auth provider */
    const passwordProvider = await prisma.authProvider.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "password",
        },
      },
    });

    if (!passwordProvider?.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /*  Verify password */
    const isValidPassword = await bcrypt.compare(
      password,
      passwordProvider.passwordHash
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* Revoke existing sessions  */
    await prisma.session.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    /* Enforce session limit */
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

    /*  Create new session */
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

    /* Generate access token */
    const accessToken = generateAccessToken(user.id);

    /* Set refresh token cookie */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        emailId: user.emailId,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

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

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { emailId } = req.body;

    const user = await prisma.user.findUnique({ where: { emailId } });
    if (!user) {
      return res.json({ message: "If the email exists, an OTP has been sent" });
    }
    if ((user.otpAttempts ?? 0) >= 3) {
      return res
        .status(429)
        .json({ message: "Too many OTP requests. Try later." });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Persist OTP safely
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpiry: expiry,
        otpAttempts: { increment: 1 },
      },
    });

    await sendEmail({
      to: user.emailId,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { emailId, otp, newPassword } = req.body;

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        emailId,
        resetOtp: hashedOtp,
        resetOtpExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.authProvider.update({
        where: {
          userId_provider: {
            userId: user.id,
            provider: "password",
          },
        },
        data: {
          passwordHash,
        },
      }),

      prisma.user.update({
        where: { id: user.id },
        data: {
          resetOtp: null,
          resetOtpExpiry: null,
          otpAttempts: 0,
        },
      }),
    ]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
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
