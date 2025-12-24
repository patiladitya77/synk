import mongoose from "mongoose";

const authProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["password"], // later: "google", "github"
      required: true,
    },
    providerUserId: {
      type: String, // Google `sub`
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuthProvider", authProviderSchema);
