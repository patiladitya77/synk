import { Request, Response } from "express";
import validateSignUpData from "../utils/validation";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
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

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    //  Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user.id,
        name: user.name,
        emailId: user.emailId,
      },
    });
  } catch (err: any) {
    console.error(err);

    res.status(400).json({
      message: err.message || "Signup failed",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;
    // const user = await User.findOne({ emailId: emailId }).select("+password");
    const user = await prisma.user.findUnique({ where: { emailId } });
    if (!user) {
      return res.status(401).send("invalid credentials");
    }

    const passwordProvider = await prisma.authProvider.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "password",
        },
      },
    });

    if (!passwordProvider || !passwordProvider.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      passwordProvider.passwordHash
    );
    if (isPasswordValid) {
      //create a token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      //sending cookie back to user
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 8 * 3600000),
        sameSite: "strict",
      });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          emailId: user.emailId,
          avatarUrl: user.avatarUrl,
        },
      });
    } else {
      return res.status(401).send("invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
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
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logout successfull");
};
