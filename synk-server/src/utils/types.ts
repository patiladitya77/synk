import { Document } from "mongoose";
import { Types } from "mongoose";
export interface IUserDocument extends Document {
  emailId: string;
  name: string;
  password?: string;
  avatarUrl?: string | null;
  lastLoginAt?: Date;
  resetOtp?: string;
  resetOtpExpiry?: Date;
  otpAttempts?: number;

  getJWT(): string;
  validatePassword(password: string): Promise<boolean>;
}

export interface JwtPayload {
  _id: Types.ObjectId;
}
