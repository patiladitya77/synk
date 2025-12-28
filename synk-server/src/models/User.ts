import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserDocument } from "../utils/types";
const userSchema = new mongoose.Schema<IUserDocument>(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpiry: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (
  passwordInputbyUser: string
) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputbyUser,
    passwordHash
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
export default User;
