import { Request, Response } from "express";
import validateSignUpData from "../utils/validation";
import bcrypt from "bcrypt";
import User from "../models/User";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";
import AuthProvider from "../models/AuthProvider";
export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, emailId, password } = req.body;

    //validaton of data
    validateSignUpData(req);

    //encryption of password
    const passwordHash = await bcrypt.hash(password, 10);

    //creating a new instance of user
    const user = new User({
      name,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();
    await AuthProvider.create({
      userId: user._id,
      provider: "password",
      providerUserId: user._id.toString(),
    });

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      //   process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "data added successfully", savedUser });
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId }).select("+password");
    if (!user) {
      return res.status(401).send("invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      //create a token
      const token = await user.getJWT();

      //sending cookie back to user
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send(user);
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

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.json({ message: "If the email exists, an OTP has been sent" });
    }
    if ((user.otpAttempts ?? 0) >= 3) {
      return res
        .status(429)
        .json({ message: "Too many OTP requests. Try later." });
    }

    user.otpAttempts = (user.otpAttempts ?? 0) + 1;

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

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

    const user = await User.findOne({
      emailId,
      resetOtp: hashedOtp,
      resetOtpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.otpAttempts = 0;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "ERROR " + err });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logout successfull");
};
