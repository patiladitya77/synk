import { Document } from "mongoose";

export interface IUserDocument extends Document {
  emailId: string;
  name: string;
  password?: string;
  avatarUrl?: string | null;
  lastLoginAt?: Date;
  resetOtp?: string;
  resetOtpExpiry?: Date;

  getJWT(): string;
  validatePassword(password: string): Promise<boolean>;
}
