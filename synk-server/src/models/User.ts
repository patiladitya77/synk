import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
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
    },
    avatarUrl: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
