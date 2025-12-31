import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["viewer", "editor"],
          default: "editor",
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    inviteToken: {
      type: String,
    },
    isInviteEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
//Slug unique per owner
boardSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

// Invite token unique ONLY when present
boardSchema.index(
  { inviteToken: 1 },
  {
    unique: true,
    partialFilterExpression: {
      inviteToken: { $type: "string" },
    },
  }
);
const Board = mongoose.model("Board", boardSchema);
export default Board;
