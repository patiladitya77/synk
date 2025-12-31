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
      enum: ["password", "google"], // extensible
      required: true,
    },

    providerUserId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate providers per user
 * (one password, one google, etc.)
 */
authProviderSchema.index({ userId: 1, provider: 1 }, { unique: true });

/**
 * Prevent provider account reuse
 * (same google account linked twice)
 */
authProviderSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

export default mongoose.model("AuthProvider", authProviderSchema);
